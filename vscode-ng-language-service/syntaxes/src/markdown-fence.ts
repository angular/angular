/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

/** Highlighting definition for Angular markdown fenced code blocks. */
export const MarkdownFence: GrammarDefinition = {
  scopeName: 'markdown.fence.ng',
  injectionSelector: 'L:text.html.markdown',
  patterns: [{include: '#angularTsFence'}, {include: '#angularHtmlFence'}],
  repository: {
    angularTsFence: {
      begin: /^(\s*)(`{3,}|~{3,})\s*(?:angular-ts)\s*$/,
      beginCaptures: {
        2: {name: 'punctuation.definition.fenced.markdown'},
      },
      end: /^(\s*)(`{3,}|~{3,})\s*$/,
      endCaptures: {
        2: {name: 'punctuation.definition.fenced.markdown'},
      },
      contentName: 'source.angular-ts meta.embedded.block.angular-ts',
      patterns: [{include: 'source.angular-ts'}],
    },
    angularHtmlFence: {
      begin: /^(\s*)(`{3,}|~{3,})\s*(?:angular-html)\s*$/,
      beginCaptures: {
        2: {name: 'punctuation.definition.fenced.markdown'},
      },
      end: /^(\s*)(`{3,}|~{3,})\s*$/,
      endCaptures: {
        2: {name: 'punctuation.definition.fenced.markdown'},
      },
      contentName: 'text.angular-html meta.embedded.block.angular-html text.html.derivative',
      // Direct includes required: inside markdown fences, the root document scope
      // is `text.html.markdown` so injections targeting `text.html.derivative` or
      // `source.ts` (via injectTo) don't fire. These ensure Angular template grammars
      // tokenize content inside `angular-html` fenced blocks.
      patterns: [
        {include: 'template.blocks.ng'},
        {include: 'template.let.ng'},
        {include: 'template.ng'},
        {include: 'template.tag.ng'},
        {include: 'text.html.derivative'},
      ],
    },
  },
};
