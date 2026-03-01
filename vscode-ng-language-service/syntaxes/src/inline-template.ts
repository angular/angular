/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

export const InlineTemplate: GrammarDefinition = {
  scopeName: 'inline-template.ng',
  // Inline templates can appear in normal TS decorators and inside markdown
  // `angular-ts` fenced blocks where decorator scope is still `meta.decorator.ts`.
  injectionSelector:
    'L:meta.decorator.ts -comment -text.html, L:meta.embedded.block.angular-ts meta.decorator.ts -comment',
  patterns: [{include: '#inlineTemplate'}],
  repository: {
    inlineTemplate: {
      begin: /(template)\s*(:)/,
      beginCaptures: {
        1: {name: 'meta.object-literal.key.ts'},
        2: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      end: /(?=,|})/,
      patterns: [{include: '#tsParenExpression'}, {include: '#ngTemplate'}],
    },

    tsParenExpression: {
      begin: /\G\s*(\()/,
      beginCaptures: {1: {name: 'meta.brace.round.ts'}},
      end: /\)/,
      endCaptures: {0: {name: 'meta.brace.round.ts'}},
      patterns: [{include: '#tsParenExpression'}, {include: '#ngTemplate'}],
    },

    ngTemplate: {
      begin: /\G\s*([`|'|"])/,
      beginCaptures: {1: {name: 'string'}},
      // @ts-ignore
      end: /\1/,
      endCaptures: {0: {name: 'string'}},
      contentName: 'text.html.derivative',
      // Include Angular template grammars before base HTML so bindings/control-flow
      // are highlighted in inline templates, including markdown fenced `angular-ts`.
      patterns: [
        {include: 'template.blocks.ng'},
        {include: 'template.let.ng'},
        {include: 'template.tag.ng'},
        {include: 'template.ng'},
        {include: 'text.html.derivative'},
      ],
    },
  },
};
