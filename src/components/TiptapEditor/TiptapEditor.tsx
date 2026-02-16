import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';
import { ReactFlowExtension } from './extensions/ReactFlowExtension';
import { ERDReferenceExtension } from './extensions/ERDReferenceExtension';
import { DiagramTypeDropdown } from './DiagramTypeDropdown';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Minus,
  Link2,
  Undo,
  Redo,
  Hash,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  editable?: boolean;
}

export function TiptapEditor({ content, onUpdate, editable = true }: TiptapEditorProps) {
  const [selectedDiagramType, setSelectedDiagramType] = useState('erd');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ReactFlowExtension,
      ERDReferenceExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] px-6 py-4',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200/50 dark:border-slate-700/50 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-sm">
      <Toolbar
        editor={editor}
        onSetLink={setLink}
        selectedDiagramType={selectedDiagramType}
        onSelectDiagramType={setSelectedDiagramType}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

interface ToolbarProps {
  editor: any;
  onSetLink: () => void;
  selectedDiagramType: string;
  onSelectDiagramType: (type: string) => void;
}

function Toolbar({ editor, onSetLink, selectedDiagramType, onSelectDiagramType }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 px-2 py-2 flex flex-wrap gap-1 sticky top-0 z-10 backdrop-blur-sm">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="Bold"
          shortcut="Cmd+B"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="Italic"
          shortcut="Cmd+I"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          label="Strikethrough"
          shortcut="Cmd+Shift+X"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          label="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          label="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          label="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      {/* Lists & Blocks */}
      <div className="flex items-center gap-0.5 px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          label="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          label="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          label="Code Block"
        >
          <FileCode className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      {/* Diagram Type Selector */}
      <div className="flex items-center gap-0.5 px-2">
        <DiagramTypeDropdown
          selectedType={selectedDiagramType}
          onSelectType={onSelectDiagramType}
        />
      </div>

      <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      {/* Insert */}
      <div className="flex items-center gap-0.5 px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={onSetLink}
          active={editor.isActive('link')}
          label="Link"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().insertReactFlow({ diagramType: selectedDiagramType }).run()}
          label="Insert Diagram"
        >
          <Hash className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      {/* History */}
      <div className="flex items-center gap-0.5 pl-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
          shortcut="Cmd+Z"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
          shortcut="Cmd+Shift+Z"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  label,
  shortcut,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`
        p-2 rounded-xl transition-all duration-150
        hover:bg-slate-200 dark:hover:bg-slate-700
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-95
        ${active
          ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
          : 'text-slate-700 dark:text-slate-300'
        }
      `}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
