import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { X, Code2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { diagramToYaml, yamlToDiagram, generateDefaultYAML } from '@/lib/yamlUtils';
import type { Node, Edge } from 'reactflow';
import type { EntityNodeData } from '../components/TiptapEditor/nodes/EntityNode';

interface YAMLEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node<EntityNodeData>[];
  edges: Edge[];
  onDiagramChange: (nodes: Node[], edges: Edge[]) => void;
}

export function YAMLEditorPanel({
  isOpen,
  onClose,
  nodes,
  edges,
  onDiagramChange,
}: YAMLEditorPanelProps) {
  const [yamlCode, setYamlCode] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const editorRef = useRef<any>(null);

  // Initialize YAML from current diagram when panel opens
  useEffect(() => {
    if (isOpen) {
      if (nodes.length > 0) {
        const yaml = diagramToYaml(nodes, edges);
        setYamlCode(yaml);
        setHasChanges(false);
        setIsValid(true);
      } else {
        // Show default template when empty
        const template = generateDefaultYAML();
        setYamlCode(template);
        setHasChanges(false);
        setIsValid(true);
      }
      setIsUserEditing(false);
    }
  }, [isOpen]); // Only run when panel opens/closes

  // Update YAML when diagram changes (but only if user isn't actively editing)
  useEffect(() => {
    if (isOpen && !isUserEditing && !hasChanges) {
      const yaml = diagramToYaml(nodes, edges);
      // Only update if different to avoid cursor jumps
      if (yaml !== yamlCode) {
        setYamlCode(yaml);
      }
    }
  }, [nodes, edges, isOpen, isUserEditing, hasChanges]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setYamlCode(value);
      setHasChanges(true);
      setIsUserEditing(true);

      // Validate YAML
      try {
        yamlToDiagram(value);
        setIsValid(true);
        setErrorMessage('');
      } catch (error) {
        setIsValid(false);
        setErrorMessage(error instanceof Error ? error.message : 'Invalid YAML');
      }
    }
  };

  // Apply YAML changes to diagram
  const handleApply = () => {
    setIsApplying(true);
    try {
      const { nodes: newNodes, edges: newEdges } = yamlToDiagram(yamlCode);
      onDiagramChange(newNodes, newEdges);
      setHasChanges(false);
      setIsUserEditing(false);
      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse YAML');
    } finally {
      setIsApplying(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S or Ctrl+S to apply
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isValid && hasChanges && !isApplying) {
          handleApply();
        }
      }
      // Escape to close
      if (e.key === 'Escape' && !hasChanges) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isValid, hasChanges, isApplying, handleApply, onClose]);

  const handleFormat = () => {
    // Trigger format in Monaco editor
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">YAML Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Edit your database schema as code
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Validation Status */}
            {!isValid && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Invalid YAML</span>
              </div>
            )}

            {isValid && !hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>In Sync</span>
              </div>
            )}

            {hasChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-medium">
                <span>Unsaved Changes</span>
              </div>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {!isValid && errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-1">
                  YAML Parsing Error
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-mono">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={yamlCode}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
              
              // Customize YAML syntax highlighting
              // Monaco will handle YAML automatically
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              autoIndent: 'full',
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
            }}
          />
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>💡 Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">⌘ + S</kbd> to apply</span>
            <span>•</span>
            <span>Visual edits sync automatically to YAML</span>
            {hasChanges && <span className="text-amber-600 dark:text-amber-400">• Unsaved changes in YAML</span>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleFormat}
              variant="outline"
              size="sm"
              disabled={!isValid}
            >
              Format
            </Button>
            
            <Button
              onClick={handleApply}
              variant="primary"
              size="sm"
              disabled={!isValid || !hasChanges || isApplying}
              leftIcon={isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            >
              {isApplying ? 'Applying...' : 'Apply Changes'}
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="px-6 pb-4">
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              📚 YAML Schema Reference
            </summary>
            <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p className="font-semibold">Basic Structure:</p>
              <pre className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto">
{`models:
  ModelName:
    fields:
      fieldName:
        field_type: "String"
        attributes:
          primary_key: true
        constraints:
          not_null: true`}
              </pre>
              <p className="font-semibold mt-3">Available Colors:</p>
              <p className="text-xs">yellow, red, teal, white, blue, green, purple, pink</p>
            </div>
          </details>
        </div>
      </div>
    </>
  );
}
