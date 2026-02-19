import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Database, ChevronDown, Link2, Link2Off } from 'lucide-react';
import { Root as SelectRoot, Trigger, Value, Content, Item } from '@radix-ui/react-select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Node, Edge } from 'reactflow';

const attributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  type: z.enum(['INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'DATETIME', 'DECIMAL', 'JSON']),
  isPrimaryKey: z.boolean(),
  isForeignKey: z.boolean(),
  isNullable: z.boolean(),
});

const entitySchema = z.object({
  name: z.string().min(1, 'Entity name is required').max(50, 'Entity name too long'),
  attributes: z.array(attributeSchema).min(1, 'At least one attribute is required'),
  color: z.string(),
});

export type EntityFormData = z.infer<typeof entitySchema>;
export type AttributeData = z.infer<typeof attributeSchema>;

const DATA_TYPES = [
  { value: 'INT', label: 'INT' },
  { value: 'VARCHAR', label: 'VARCHAR' },
  { value: 'TEXT', label: 'TEXT' },
  { value: 'BOOLEAN', label: 'BOOLEAN' },
  { value: 'DATE', label: 'DATE' },
  { value: 'DATETIME', label: 'DATETIME' },
  { value: 'DECIMAL', label: 'DECIMAL' },
  { value: 'JSON', label: 'JSON' },
] as const;

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EntityFormData) => void;
  initialData?: EntityFormData;
  currentNodeId?: string;
  allNodes?: Node[];
  allEdges?: Edge[];
  onEdgesChange?: (edges: Edge[]) => void;
}

// Helper to create default entity data
const getDefaultEntityData = (): EntityFormData => ({
  name: '',
  color: '#ffffff',
  attributes: [
    {
      name: 'id',
      type: 'INT',
      isPrimaryKey: true,
      isForeignKey: false,
      isNullable: false,
    },
  ],
});

export function EntityFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentNodeId,
  allNodes = [],
  allEdges = [],
  onEdgesChange
}: EntityFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // Get edges connected to this entity
  const connectedEdges = allEdges.filter(edge =>
    edge.source === currentNodeId || edge.target === currentNodeId
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    mode: 'onChange',
    defaultValues: getDefaultEntityData(),
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'attributes',
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Deep clone to avoid reference issues
        reset({
          name: initialData.name,
          color: initialData.color || '#ffffff',
          attributes: initialData.attributes.map(attr => ({
            name: attr.name,
            type: attr.type,
            isPrimaryKey: attr.isPrimaryKey,
            isForeignKey: attr.isForeignKey,
            isNullable: attr.isNullable,
          })),
        });
      } else {
        reset(getDefaultEntityData());
      }
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = async (data: EntityFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset(getDefaultEntityData());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttribute = () => {
    append({
      name: '',
      type: 'VARCHAR',
      isPrimaryKey: false,
      isForeignKey: false,
      isNullable: true,
    });
  };

  const updateAttribute = (index: number, field: string, value: any) => {
    update(index, { ...fields[index], [field]: value });
  };

  const handleClose = () => {
    reset(getDefaultEntityData());
    onClose();
  };

  // Get connected entities for a given edge direction
  const getConnectedEntities = (direction: 'incoming' | 'outgoing') => {
    if (!currentNodeId) return [];

    return connectedEdges
      .filter(edge => direction === 'outgoing' ? edge.source === currentNodeId : edge.target === currentNodeId)
      .map(edge => {
        const otherNodeId = direction === 'outgoing' ? edge.target : edge.source;
        const otherNode = allNodes.find(n => n.id === otherNodeId);
        return {
          edge,
          otherNode,
          edgeType: String(edge.label || '1:N')
        };
      });
  };

  // Get available entities to connect with
  const getAvailableEntities = () => {
    if (!currentNodeId) return [];

    const connectedNodeIds = new Set([
      ...connectedEdges.map(e => e.source),
      ...connectedEdges.map(e => e.target)
    ]);

    return allNodes.filter(node => node.id !== currentNodeId && !connectedNodeIds.has(node.id));
  };

  // Add a new edge
  const handleAddEdge = async (otherNodeId: string, direction: 'source' | 'target', edgeType: string) => {
    if (!onEdgesChange || !currentNodeId) return;

    const newEdge: Edge = {
      id: `edge-${currentNodeId}-${otherNodeId}-${Date.now()}`,
      source: direction === 'source' ? currentNodeId : otherNodeId,
      target: direction === 'target' ? currentNodeId : otherNodeId,
      type: 'custom',
      label: edgeType,
      data: { label: edgeType },
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    };

    onEdgesChange([...allEdges, newEdge]);
  };

  // Remove an edge
  const handleRemoveEdge = (edgeId: string) => {
    if (!onEdgesChange) return;
    onEdgesChange(allEdges.filter(e => e.id !== edgeId));
  };

  // Change edge type
  const handleChangeEdgeType = (edgeId: string, newType: string) => {
    if (!onEdgesChange) return;
    onEdgesChange(
      allEdges.map(edge =>
        edge.id === edgeId
          ? { ...edge, label: newType, data: { label: newType } }
          : edge
      )
    );
  };

  // Edge type change handler for select element
  const handleEdgeTypeChange = (edgeId: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChangeEdgeType(edgeId, e.target.value);
  };

  if (!isOpen) return null;

  const outgoingEdges = getConnectedEntities('outgoing');
  const incomingEdges = getConnectedEntities('incoming');
  const availableEntities = getAvailableEntities();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in glass-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isEditMode ? 'Edit Entity' : 'New Entity'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isEditMode ? 'Modify entity properties and relationships' : 'Define entity attributes and constraints'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            isSquared
            className="!p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Entity Name & Color */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Input
                  {...register('name')}
                  label="Entity Name"
                  placeholder="e.g., Users, Posts, Orders"
                  error={errors.name?.message}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Entity Color
                </label>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2 flex-wrap">
                      {['#ffffff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#fecaca', '#fca5a5', '#f87171', '#ef4444'].map((color) => (
                        <label key={color} className="cursor-pointer">
                          <input
                            {...field}
                            type="radio"
                            value={color}
                            checked={field.value === color}
                            onChange={() => field.onChange(color)}
                            className="sr-only"
                          />
                          <div
                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                              field.value === color
                                ? 'border-indigo-500 shadow-md scale-110'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Attributes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Attributes
                </label>
                <Button
                  type="button"
                  onClick={addAttribute}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Attribute
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Name */}
                      <div className="flex-1">
                        <Controller
                          name={`attributes.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Attribute name"
                              size="sm"
                              error={errors.attributes?.[index]?.name?.message}
                            />
                          )}
                        />
                      </div>

                      {/* Type - Radix Select with Controller */}
                      <div className="w-40">
                        <Controller
                          name={`attributes.${index}.type`}
                          control={control}
                          render={({ field: selectField }) => (
                            <SelectRoot
                              value={selectField.value}
                              onValueChange={(value) => {
                                selectField.onChange(value);
                                updateAttribute(index, 'type', value);
                              }}
                            >
                              <Trigger className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all flex items-center justify-between">
                                <Value placeholder="Type" />
                                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                              </Trigger>
                              <Content className="z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                                {DATA_TYPES.map((type) => (
                                  <Item
                                    key={type.value}
                                    value={type.value}
                                    className="px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50"
                                  >
                                    {type.label}
                                  </Item>
                                ))}
                              </Content>
                            </SelectRoot>
                          )}
                        />
                      </div>

                      {/* Remove Button */}
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        />
                      )}
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-4">
                      <Controller
                        name={`attributes.${index}.isPrimaryKey`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Primary Key</span>
                          </label>
                        )}
                      />

                      <Controller
                        name={`attributes.${index}.isForeignKey`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Foreign Key</span>
                          </label>
                        )}
                      />

                      <Controller
                        name={`attributes.${index}.isNullable`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Nullable</span>
                          </label>
                        )}
                      />
                    </div>

                    {errors.attributes?.[index]?.name && (
                      <p className="text-xs text-rose-600 dark:text-rose-400">
                        {errors.attributes[index]?.name?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {errors.attributes && (
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                  {errors.attributes.message}
                </p>
              )}
            </div>

            {/* Relationships Section - Only show in edit mode */}
            {isEditMode && currentNodeId && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Relationships
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage connections to other entities
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Outgoing Relationships (This entity -> Others) */}
                  {outgoingEdges.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Points To ({outgoingEdges.length})
                      </h4>
                      <div className="space-y-2">
                        {outgoingEdges.map(({ edge, otherNode, edgeType }) => (
                          <div
                            key={edge.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Link2 className="w-4 h-4 text-indigo-500" />
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {otherNode?.data?.label || 'Unknown'}
                              </span>
                              <select
                                value={edgeType || '1:N'}
                                onChange={handleEdgeTypeChange(edge.id)}
                                className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              >
                                <option value="1:1">1:1</option>
                                <option value="1:N">1:N</option>
                                <option value="N:1">N:1</option>
                                <option value="N:M">N:M</option>
                              </select>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleRemoveEdge(edge.id)}
                              variant="ghost"
                              size="sm"
                              className="!text-rose-600 hover:!text-rose-700 hover:!bg-rose-50 dark:hover:!bg-rose-950/20"
                              leftIcon={<Link2Off className="w-4 h-4" />}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incoming Relationships (Others -> This entity) */}
                  {incomingEdges.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Pointed From ({incomingEdges.length})
                      </h4>
                      <div className="space-y-2">
                        {incomingEdges.map(({ edge, otherNode, edgeType }) => (
                          <div
                            key={edge.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Link2 className="w-4 h-4 text-emerald-500" style={{ transform: 'rotate(180deg)' }} />
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {otherNode?.data?.label || 'Unknown'}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                {edgeType || '1:N'}
                              </span>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleRemoveEdge(edge.id)}
                              variant="ghost"
                              size="sm"
                              className="!text-rose-600 hover:!text-rose-700 hover:!bg-rose-50 dark:hover:!bg-rose-950/20"
                              leftIcon={<Link2Off className="w-4 h-4" />}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Relationship */}
                  {availableEntities.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Add Relationship
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Point to another entity */}
                        <div className="space-y-2">
                          <label className="text-xs text-slate-600 dark:text-slate-400">
                            This entity points to:
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              id="point-to-entity"
                            >
                              <option value="">Select entity...</option>
                              {availableEntities.map(node => (
                                <option key={node.id} value={node.id}>
                                  {node.data?.label || 'Unknown'}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-20 px-2 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              id="point-to-type"
                            >
                              <option value="1:1">1:1</option>
                              <option value="1:N">1:N</option>
                              <option value="N:M">N:M</option>
                            </select>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                const select = document.getElementById('point-to-entity') as HTMLSelectElement;
                                const typeSelect = document.getElementById('point-to-type') as HTMLSelectElement;
                                if (select.value && typeSelect.value) {
                                  handleAddEdge(select.value, 'source', typeSelect.value);
                                  select.value = '';
                                }
                              }}
                              leftIcon={<Link2 className="w-4 h-4" />}
                            >
                              Add
                            </Button>
                          </div>
                        </div>

                        {/* Another entity points to this */}
                        <div className="space-y-2">
                          <label className="text-xs text-slate-600 dark:text-slate-400">
                            Points from entity:
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              id="point-from-entity"
                            >
                              <option value="">Select entity...</option>
                              {availableEntities.map(node => (
                                <option key={node.id} value={node.id}>
                                  {node.data?.label || 'Unknown'}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-20 px-2 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              id="point-from-type"
                            >
                              <option value="1:1">1:1</option>
                              <option value="N:1">N:1</option>
                              <option value="N:M">N:M</option>
                            </select>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                const select = document.getElementById('point-from-entity') as HTMLSelectElement;
                                const typeSelect = document.getElementById('point-from-type') as HTMLSelectElement;
                                if (select.value && typeSelect.value) {
                                  handleAddEdge(select.value, 'target', typeSelect.value);
                                  select.value = '';
                                }
                              }}
                              leftIcon={<Link2 className="w-4 h-4" />}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {availableEntities.length === 0 && connectedEdges.length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                      <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No relationships yet</p>
                      <p className="text-xs mt-1">Connect this entity to others to define relationships</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              variant="primary"
              isLoading={isSubmitting}
            >
              {isEditMode ? 'Update Entity' : 'Create Entity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
