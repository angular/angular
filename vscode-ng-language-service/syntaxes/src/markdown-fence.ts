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
      // Directly include Angular template grammars so they fire even when the
      // injection mechanism is unavailable (e.g. root grammar is text.html.markdown
      // but the grammar's injectTo doesn't match). Template grammars are also
      // registered as injections (see injectTo in package.json), so these direct
      // includes act as belt-and-suspenders for content between tags.
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
