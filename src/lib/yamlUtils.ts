import yaml from 'js-yaml';
import type { Node, Edge } from 'reactflow';
import type { EntityNodeData } from '../components/TiptapEditor/nodes/EntityNode';

export interface ERDYamlSchema {
  diagram_type: string;
  version: string;
  metadata?: {
    name: string;
    description?: string;
    schema_version?: string;
  };
  colors?: {
    default?: string;
    rules?: Array<{
      pattern: string;
      color: string;
      group: string;
    }>;
  };
  models: {
    [key: string]: {
      color?: string;
      group?: string;
      table_name?: string;
      schema_name?: string;
      fields: {
        [key: string]: {
          field_type: string;
          db_type?: string;
          attributes?: {
            primary_key?: boolean;
            unique?: boolean;
            default_value?: string;
            foreign_key?: {
              table: string;
              column: string;
              on_delete?: string;
              on_update?: string;
            };
            virtual?: boolean;
            referenced_by?: string;
            enum?: string;
            is_list?: boolean;
            map?: string;
          };
          constraints?: {
            not_null?: boolean;
          };
        };
      };
      // Explicit relationships/edges
      relationships?: Array<{
        name: string;
        field: string;
        to_model: string;
        to_field: string;
        relationship_type: '1:1' | '1:N' | 'N:1' | 'N:M';
        on_delete?: string;
        on_update?: string;
      }>;
      indexes?: Array<{
        index_name: string;
        columns: string[];
        unique?: boolean;
      }>;
      unique_constraints?: Array<{
        constraint_name: string;
        columns: string[];
      }>;
    };
  };
  enums?: {
    [key: string]: {
      values: Array<{
        value_name: string;
        description?: string;
      }>;
    };
  };
}

// Color mapping from YAML to CSS
const COLOR_MAP: Record<string, string> = {
  yellow: '#fef3c7', // amber-100
  red: '#fecaca', // red-200
  teal: '#99f6e4', // teal-200
  white: '#ffffff',
  blue: '#bfdbfe', // blue-200
  green: '#bbf7d0', // green-200
  purple: '#e9d5ff', // purple-200
  pink: '#fbcfe8', // pink-200
};

/**
 * Convert YAML string to ReactFlow nodes and edges
 */
export function yamlToDiagram(yamlString: string): { nodes: Node[]; edges: Edge[] } {
  try {
    const data = yaml.load(yamlString) as ERDYamlSchema;
    
    if (!data || !data.models) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Calculate positions in a grid
    const models = Object.keys(data.models);
    const gridSize = Math.ceil(Math.sqrt(models.length));
    const nodeWidth = 280;
    const nodeHeight = 200;
    const gap = 60;

    // Create nodes from models
    models.forEach((modelName, index) => {
      const model = data.models[modelName];
      
      // Calculate grid position
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = col * (nodeWidth + gap) + 50;
      const y = row * (nodeHeight + gap) + 50;

      // Get color
      const modelColor = model.color || data.colors?.default || 'white';
      const backgroundColor = COLOR_MAP[modelColor] || modelColor;

      // Convert fields to attributes
      const attributes = Object.entries(model.fields || {}).map(([fieldName, field]) => ({
        name: fieldName,
        type: field.db_type || field.field_type,
        isPrimaryKey: field.attributes?.primary_key || false,
        isForeignKey: !!field.attributes?.foreign_key,
        isNullable: !field.constraints?.not_null,
      }));

      const node: Node<EntityNodeData> = {
        id: modelName,
        type: 'entity',
        position: { x, y },
        data: {
          label: model.table_name || modelName,
          attributes,
        },
        style: {
          backgroundColor,
        },
      };

      nodes.push(node);
      
      // Process explicit relationships if defined
      if (model.relationships && model.relationships.length > 0) {
        model.relationships.forEach((rel, relIndex) => {
          const edgeId = `${modelName}-${rel.name || `rel_${relIndex}`}`;
          
          // Map relationship type to edge label
          const edgeLabel = rel.relationship_type;
          
          // Determine edge color based on relationship type
          const edgeColors: Record<string, string> = {
            '1:1': '#3b82f6', // blue
            '1:N': '#8b5cf6', // violet
            'N:1': '#8b5cf6', // violet
            'N:M': '#ec4899', // pink
          };
          
          const edge: Edge = {
            id: edgeId,
            source: modelName,
            target: rel.to_model,
            type: 'custom',
            label: edgeLabel,
            data: { 
              label: edgeLabel,
              // Store field mapping for reference
              fromField: rel.field,
              toField: rel.to_field,
            },
            style: { 
              stroke: edgeColors[edgeLabel] || '#8b5cf6', 
              strokeWidth: edgeLabel === 'N:M' ? 3 : 2 
            },
            // Add dashed style for N:M
            ...(edgeLabel === 'N:M' && {
              style: {
                stroke: '#ec4899',
                strokeWidth: 3,
                strokeDasharray: '5,5',
              }
            }),
          };

          edges.push(edge);
        });
      }

      // Create edges from foreign keys (for backwards compatibility)
      Object.entries(model.fields || {}).forEach(([fieldName, field]) => {
        if (field.attributes?.foreign_key && !field.attributes.virtual) {
          const fk = field.attributes.foreign_key;
          const edgeId = `${modelName}-${fieldName}-${fk.table}-${fk.column}`;
          
          // Check if this relationship is already defined in relationships array
          const alreadyDefined = model.relationships?.some(
            rel => rel.field === fieldName && rel.to_model === fk.table
          );
          
          if (alreadyDefined) return; // Skip if already defined
          
          // Determine relationship type
          let relationshipType = 'N:1';
          
          const edge: Edge = {
            id: edgeId,
            source: modelName,
            target: fk.table,
            type: 'custom',
            label: relationshipType,
            data: { 
              label: relationshipType,
              fromField: fieldName,
              toField: fk.column,
            },
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          };

          edges.push(edge);
        }
      });
    });

    return { nodes, edges };
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return { nodes: [], edges: [] };
  }
}

/**
 * Convert ReactFlow nodes and edges to YAML string
 */
export function diagramToYaml(nodes: Node<EntityNodeData>[], edges: Edge[]): string {
  const models: ERDYamlSchema['models'] = {};
  const enums: ERDYamlSchema['enums'] = {};

  // Process each node (entity)
  nodes.forEach((node) => {
    const modelName = node.data.label;
    const bgColor = (node.style as any)?.backgroundColor || '#ffffff';
    
    // Find matching color
    let color = 'white';
    Object.entries(COLOR_MAP).forEach(([colorName, colorValue]) => {
      if (bgColor.toLowerCase().includes(colorValue.toLowerCase())) {
        color = colorName;
      }
    });

    // Convert attributes to fields
    const fields: ERDYamlSchema['models']['string']['fields'] = {};
    
    node.data.attributes.forEach((attr) => {
      const field: ERDYamlSchema['models']['string']['fields']['string'] = {
        field_type: attr.type,
        db_type: attr.type,
      };

      // Add attributes
      const attributes: any = {};
      const constraints: any = {};

      if (attr.isPrimaryKey) {
        attributes.primary_key = true;
        attributes.unique = true;
        attributes.default_value = 'cuid()';
      }

      if (!attr.isNullable && !attr.isPrimaryKey) {
        constraints.not_null = true;
      }

      if (Object.keys(attributes).length > 0) {
        field.attributes = attributes;
      }
      if (Object.keys(constraints).length > 0) {
        field.constraints = constraints;
      }

      fields[attr.name] = field;
    });

    // Find all edges/relationships for this model
    const relationships = edges
      .filter((edge) => edge.source === node.id)
      .map((edge) => {
        const edgeLabel = edge.data?.label as string || '1:N';
        return {
          name: `rel_${edge.target}`,
          field: (edge.data as any)?.fromField || `${node.id.toLowerCase()}_id`,
          to_model: edge.target,
          to_field: (edge.data as any)?.toField || 'id',
          relationship_type: edgeLabel as '1:1' | '1:N' | 'N:1' | 'N:M',
          on_delete: 'CASCADE',
          on_update: 'CASCADE',
        };
      });

    models[modelName] = {
      color,
      fields,
      ...(relationships.length > 0 && { relationships }),
    };
  });

  const schema: ERDYamlSchema = {
    diagram_type: 'erd',
    version: '1.0',
    metadata: {
      name: 'Database Schema',
    },
    colors: {
      default: 'white',
    },
    models,
  };

  if (Object.keys(enums).length > 0) {
    schema.enums = enums;
  }

  return yaml.dump(schema, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

/**
 * Generate default YAML template
 */
export function generateDefaultYAML(): string {
  const template: ERDYamlSchema = {
    diagram_type: 'erd',
    version: '1.0',
    metadata: {
      name: 'My Database Schema',
      description: 'Database schema description',
      schema_version: '1.0.0',
    },
    colors: {
      default: 'white',
      rules: [
        {
          pattern: '^(User|Account|Session)',
          color: 'yellow',
          group: 'Authentication',
        },
        {
          pattern: '^(Post|Comment|Article)',
          color: 'red',
          group: 'Content',
        },
      ],
    },
    models: {
      User: {
        color: 'yellow',
        group: 'Authentication',
        table_name: 'users',
        fields: {
          id: {
            field_type: 'String',
            db_type: 'VARCHAR(255)',
            attributes: {
              primary_key: true,
              unique: true,
              default_value: 'cuid()',
            },
            constraints: {
              not_null: true,
            },
          },
          email: {
            field_type: 'String',
            db_type: 'VARCHAR(255)',
            attributes: {
              unique: true,
            },
            constraints: {
              not_null: true,
            },
          },
          name: {
            field_type: 'String',
            db_type: 'VARCHAR(255)',
          },
          createdAt: {
            field_type: 'Int',
            db_type: 'INTEGER',
            attributes: {
              default_value: 'now()',
            },
          },
          // Virtual field showing posts (not stored in DB)
          posts: {
            field_type: 'Post',
            db_type: 'Post',
            attributes: {
              virtual: true,
              referenced_by: 'authorId',
            },
          },
        },
        // Explicit relationships
        relationships: [
          {
            name: 'user_posts',
            field: 'id',
            to_model: 'Post',
            to_field: 'authorId',
            relationship_type: '1:N',
            on_delete: 'CASCADE',
            on_update: 'CASCADE',
          },
        ],
        indexes: [
          {
            index_name: 'idx_user_email',
            columns: ['email'],
            unique: true,
          },
        ],
      },
      Post: {
        color: 'red',
        group: 'Content',
        table_name: 'posts',
        fields: {
          id: {
            field_type: 'String',
            db_type: 'VARCHAR(255)',
            attributes: {
              primary_key: true,
              default_value: 'cuid()',
            },
            constraints: {
              not_null: true,
            },
          },
          title: {
            field_type: 'String',
            db_type: 'VARCHAR(255)',
            constraints: {
              not_null: true,
            },
          },
          content: {
            field_type: 'String',
            db_type: 'TEXT',
          },
          authorId: {
            field_type: 'String',
            db_type: 'VARCHAR(255)',
            attributes: {
              foreign_key: {
                table: 'User',
                column: 'id',
                on_delete: 'CASCADE',
              },
            },
            constraints: {
              not_null: true,
            },
          },
          publishedAt: {
            field_type: 'Int',
            db_type: 'INTEGER',
          },
        },
        // Explicit relationships
        relationships: [
          {
            name: 'post_author',
            field: 'authorId',
            to_model: 'User',
            to_field: 'id',
            relationship_type: 'N:1',
            on_delete: 'CASCADE',
            on_update: 'CASCADE',
          },
        ],
      },
    },
  };

  return yaml.dump(template, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
