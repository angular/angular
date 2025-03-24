/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, Token, RendererThis, TokenizerThis} from 'marked';

interface DocsCardContainerToken extends Tokens.Generic {
  type: 'docs-card-container';
  cards: string;
  tokens: Token[];
}

const cardContainerRule = /^<docs-card-container>(.*?)<\/docs-card-container>/s;

export const docsCardContainerExtension = {
  name: 'docs-card-container',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-card-container/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCardContainerToken | undefined {
    const match = cardContainerRule.exec(src);

    if (match) {
      const body = match[1];
      const token: DocsCardContainerToken = {
        type: 'docs-card-container',
        raw: match[0],
        cards: body ?? '',
        tokens: [],
      };
      this.lexer.blockTokens(token.cards, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCardContainerToken) {
    return `
    <div class="docs-card-grid">
      ${this.parser.parse(token.tokens)}
    </div>
    `;
  },
};
