/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// copy of https://github.com/angular/angular/blob/main/packages/language-service/src/quick_info_built_ins.ts

import {StructuralQuickInfo} from './facade.js';
import {Call, PropertyRead, ImplicitReceiver, TmplAstNode, AST} from '@angular/compiler';

const triggerDescriptionPreamble = 'A trigger to start loading the defer content after ';

const BUILT_IN_NAMES_TO_DOC_MAP: {
  [name: string]: {docString: string; links: string[]; kind: string};
} = {
  '@defer': {
    docString: `A type of block that can be used to defer load the JavaScript for components, directives and pipes used inside a component template.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#defer)'],
    kind: 'block',
  },
  '@placeholder': {
    docString: `A block for content shown prior to defer loading (Optional)`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#placeholder)'],
    kind: 'block',
  },
  '@error': {
    docString: `A block for content shown when defer loading errors occur (Optional)`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#error)'],
    kind: 'block',
  },
  '@loading': {
    docString: `A block for content shown during defer loading (Optional)`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#loading)'],
    kind: 'block',
  },
  '@empty': {
    docString: `A block to display when the for loop variable is empty.`,
    links: [
      '[Reference](https://angular.dev/guide/templates/control-flow#providing-a-fallback-for-for-blocks-with-the-empty-block)',
    ],
    kind: 'block',
  },
  'track': {
    docString: `Keyword to control how the for loop compares items in the list to compute updates.`,
    links: [
      '[Reference](https://angular.dev/guide/templates/control-flow#why-is-track-in-for-blocks-important)',
    ],
    kind: 'keyword',
  },
  'idle': {
    docString:
      triggerDescriptionPreamble + `the browser reports idle state. Accepts an optional timeout.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-idle)'],
    kind: 'trigger',
  },
  'immediate': {
    docString: triggerDescriptionPreamble + `the page finishes rendering.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-immediate)'],
    kind: 'trigger',
  },
  'hover': {
    docString: triggerDescriptionPreamble + `the element has been hovered.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-hover)'],
    kind: 'trigger',
  },
  'timer': {
    docString: triggerDescriptionPreamble + `a specific timeout.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-timer)'],
    kind: 'trigger',
  },
  'interaction': {
    docString: triggerDescriptionPreamble + `the element is clicked, touched, or focused.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-interaction)'],
    kind: 'trigger',
  },
  'viewport': {
    docString: triggerDescriptionPreamble + `the element enters the viewport.`,
    links: ['[Reference](https://angular.dev/guide/templates/defer#on-viewport)'],
    kind: 'trigger',
  },
  'prefetch': {
    docString:
      'Keyword that indicates that the trigger configures when prefetching the defer block contents should start. You can use `on` and `when` conditions as prefetch triggers.',
    links: ['[Reference](https://angular.dev/guide/templates/defer#prefetching)'],
    kind: 'keyword',
  },
  'hydrate': {
    docString:
      "Keyword that indicates when the block's content will be hydrated. You can use `on` and `when` conditions as hydration triggers, or `hydrate never` to disable hydration for this block.",
    links: ['[Reference](https://angular.dev/guide/incremental-hydration)'],
    kind: 'keyword',
  },
  'when': {
    docString:
      'Keyword that starts the expression-based trigger section. Should be followed by an expression that returns a boolean.',
    links: ['[Reference](https://angular.dev/guide/templates/defer#triggers)'],
    kind: 'keyword',
  },
  'on': {
    docString:
      'Keyword that starts the event-based trigger section. Should be followed by one of the built-in triggers.',
    links: ['[Reference](https://angular.dev/guide/templates/defer#triggers)'],
    kind: 'keyword',
  },
};

export function getQuickInfoForBuiltIn(name: string): StructuralQuickInfo | null {
  const partInfo = BUILT_IN_NAMES_TO_DOC_MAP[name];
  if (!partInfo) return null;

  const linksText = partInfo.links.join('\n\n');
  const text = `\`\`\`keyword\n(${partInfo.kind}) ${name}\n\`\`\`\n\n${partInfo.docString}${linksText ? '\n\n' + linksText : ''}`;

  return {
    text,
    kind: partInfo.kind,
  };
}

export function isDollarAny(node: TmplAstNode | AST): node is Call {
  return (
    node instanceof Call &&
    node.receiver instanceof PropertyRead &&
    node.receiver.receiver instanceof ImplicitReceiver &&
    node.receiver.name === '$any' &&
    node.args.length === 1
  );
}

export function createDollarAnyQuickInfo(): StructuralQuickInfo {
  return {
    text: `\`\`\`keyword\n(method) $any\n\`\`\`\n\nfunction to cast an expression to the \`any\` type`,
    kind: 'method',
  };
}

export function createNgTemplateQuickInfo(): StructuralQuickInfo {
  return {
    text: `\`\`\`keyword\n(template) ng-template\n\`\`\`\n\nThe \`<ng-template>\` is an Angular element for rendering HTML. It is never displayed directly.`,
    kind: 'template',
  };
}
