import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Database, ChevronDown } from 'lucide-react';
import { Root as SelectRoot, Trigger, Value, Content, Item } from '@radix-ui/react-select';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

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
  color: z.string().optional(),
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
}

export function EntityFormModal({ isOpen, onClose, onSubmit, initialData }: EntityFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: initialData || {
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
    },
  });

  const selectedColor = watch('color', '#ffffff');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
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
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = async (data: EntityFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in glass-strong"
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
                {initialData ? 'Edit Entity' : 'New Entity'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Define entity attributes and constraints
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
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
                <div className="flex items-center gap-2 flex-wrap">
                  {['#ffffff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#fecaca', '#fca5a5', '#f87171', '#ef4444'].map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        {...register('color')}
                        type="radio"
                        value={color}
                        className="sr-only"
                      />
                      <div
                        className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                          selectedColor === color
                            ? 'border-indigo-500 shadow-md scale-110'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Attributes */}
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

              <div className="space-y-3 stagger-children">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Name */}
                      <div className="flex-1">
                        <Input
                          {...register(`attributes.${index}.name`)}
                          placeholder="Attribute name"
                          size="sm"
                          error={errors.attributes?.[index]?.name?.message}
                        />
                      </div>

                      {/* Type - Radix Select */}
                      <div className="w-40">
                        <SelectRoot
                          value={watch(`attributes.${index}.type`)}
                          onValueChange={(value) => {
                            // @ts-ignore - updating nested array field
                            setValue(`attributes.${index}.type`, value as any);
                          }}
                        >
                          <Trigger className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all flex items-center justify-between">
                            <Value placeholder="Select type" />
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
                      <Checkbox
                        {...register(`attributes.${index}.isPrimaryKey`)}
                        label="Primary Key"
                      />

                      <Checkbox
                        {...register(`attributes.${index}.isForeignKey`)}
                        label="Foreign Key"
                      />

                      <Checkbox
                        {...register(`attributes.${index}.isNullable`)}
                        label="Nullable"
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Button
              type="button"
              onClick={onClose}
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
              {initialData ? 'Update Entity' : 'Create Entity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
