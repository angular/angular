/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

export const InlineStyles: GrammarDefinition = {
  scopeName: 'inline-styles.ng',
  // Support styles parsing both in regular decorator scopes and when decorators
  // are inside markdown `angular-ts` fenced blocks.
  injectionSelector:
    'L:source.ts#meta.decorator.ts -comment, L:meta.embedded.block.angular-ts meta.decorator.ts -comment',
  patterns: [{include: '#inlineStyles'}],
  repository: {
    inlineStyles: {
      begin: /(styles)\s*(:)/,
      beginCaptures: {
        1: {name: 'meta.object-literal.key.ts'},
        2: {name: 'meta.object-literal.key.ts punctuation.separator.key-value.ts'},
      },
      end: /(?=,|})/,
      patterns: [
        {include: '#tsParenExpression'},
        {include: '#tsBracketExpression'},
        {include: '#style'},
      ],
    },

    tsParenExpression: {
      begin: /\G\s*(\()/,
      beginCaptures: {1: {name: 'meta.brace.round.ts'}},
      end: /\)/,
      endCaptures: {0: {name: 'meta.brace.round.ts'}},
      patterns: [{include: '$self'}, {include: '#tsBracketExpression'}, {include: '#style'}],
    },

    'tsBracketExpression': {
      begin: /\G\s*(\[)/,
      beginCaptures: {1: {name: 'meta.array.literal.ts meta.brace.square.ts'}},
      end: /\]/,
      endCaptures: {0: {name: 'meta.array.literal.ts meta.brace.square.ts'}},
      patterns: [{include: '#style'}],
    },

    style: {
      begin: /\s*([`|'|"])/,
      beginCaptures: {1: {name: 'string'}},
      // @ts-ignore
      end: /\1/,
      endCaptures: {0: {name: 'string'}},
      contentName: 'source.css.scss',
      patterns: [{include: 'source.css.scss'}],
    },
  },
};
