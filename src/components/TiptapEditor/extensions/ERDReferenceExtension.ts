import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ERDReferenceNodeView } from './ERDReferenceNodeView';

export interface ERDReferenceNodeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    erdReference: {
      /**
       * Insert an ERD diagram reference by ID
       */
      insertERDReference: (options: { diagramId: string; caption?: string }) => ReturnType;
    };
  }
}

export const ERDReferenceExtension = Node.create<ERDReferenceNodeOptions>({
  name: 'erdReference',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      diagramId: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-diagram-id'),
        renderHTML: (attributes: any) => {
          if (!attributes.diagramId) {
            return {};
          }
          return {
            'data-diagram-id': attributes.diagramId,
          };
        },
      },
      caption: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-caption'),
        renderHTML: (attributes: any) => {
          if (!attributes.caption) {
            return {};
          }
          return {
            'data-caption': attributes.caption,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        // Match special syntax: [[erd:diagram-id]]
        tag: 'span',
        getAttrs: (node: any) => {
          const text = node.textContent;
          const match = text.match(/\[\[erd:([a-zA-Z0-9-]+)(?:\|([^\]]+))?\]\]/);
          if (match) {
            return {
              diagramId: match[1],
              caption: match[2] || null,
            };
          }
          return false;
        },
      },
      {
        tag: 'span[data-type="erd-reference"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: any) {
    return ['span', { 'data-type': 'erd-reference', ...HTMLAttributes }];
  },

  addCommands() {
    return {
      insertERDReference:
        (options: any = {}) =>
        ({ commands }: any) => {
          const { diagramId, caption } = options;

          if (!diagramId) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              diagramId,
              caption,
            },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ERDReferenceNodeView as any, {
      contentDOMElementTag: 'span',
    });
  },
});
