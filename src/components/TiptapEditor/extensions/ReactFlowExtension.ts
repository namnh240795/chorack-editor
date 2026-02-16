import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ReactFlowNodeView } from './ReactFlowNodeView';

function generateUUID(): string {
  return 'flow-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

export interface ReactFlowNodeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reactFlow: {
      /**
       * Insert a ReactFlow node
       */
      insertReactFlow: (options?: { width?: number; height?: number; diagramType?: string }) => ReturnType;
    };
  }
}

export const ReactFlowExtension = Node.create<ReactFlowNodeOptions>({
  name: 'reactFlow',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      flowId: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-flow-id'),
        renderHTML: (attributes: any) => {
          if (!attributes.flowId) {
            return {};
          }
          return {
            'data-flow-id': attributes.flowId,
          };
        },
      },
      diagramType: {
        default: 'erd',
        parseHTML: (element: any) => element.getAttribute('data-diagram-type') || 'erd',
        renderHTML: (attributes: any) => {
          return {
            'data-diagram-type': attributes.diagramType,
          };
        },
      },
      width: {
        default: 600,
        parseHTML: (element: any) => {
          const width = element.getAttribute('data-width');
          return width ? parseInt(width, 10) : 600;
        },
        renderHTML: (attributes: any) => {
          return {
            'data-width': attributes.width,
          };
        },
      },
      height: {
        default: 400,
        parseHTML: (element: any) => {
          const height = element.getAttribute('data-height');
          return height ? parseInt(height, 10) : 400;
        },
        renderHTML: (attributes: any) => {
          return {
            'data-height': attributes.height,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="react-flow"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: any) {
    return ['div', { 'data-type': 'react-flow', ...HTMLAttributes }];
  },

  addCommands() {
    return {
      insertReactFlow:
        (options: any = {}) =>
        ({ commands }: any) => {
          const width = options.width ?? 600;
          const height = options.height ?? 400;
          const diagramType = options.diagramType ?? 'erd';
          const flowId = generateUUID();

          return commands.insertContent({
            type: this.name,
            attrs: {
              flowId,
              diagramType,
              width,
              height,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReactFlowNodeView as any, {
      contentDOMElementTag: 'div',
    });
  },
});
