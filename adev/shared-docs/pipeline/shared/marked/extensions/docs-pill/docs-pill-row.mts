/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Token, Tokens, RendererThis, TokenizerThis} from 'marked';

interface DocsPillRowToken extends Tokens.Generic {
  type: 'docs-pill-row';
  pills: string;
  tokens: Token[];
}

// Capture group 1: all content between the open and close tags
const pillRowRule = /^\s*<docs-pill-row>((?:.(?!docs-pill-row))*)<\/docs-pill-row>/s;

export const docsPillRowExtension = {
  name: 'docs-pill-row',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-pill-row/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsPillRowToken | undefined {
    const match = pillRowRule.exec(src);

    if (match) {
      const body = match[1];
      const token: DocsPillRowToken = {
        type: 'docs-pill-row',
        raw: match[0],
        pills: body ?? '',
        tokens: [],
      };
      this.lexer.inlineTokens(token.pills, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsPillRowToken) {
    return `
    <nav class="docs-pill-row">
      ${this.parser.parseInline(token.tokens)}
    </nav>
    `;
  },
};
