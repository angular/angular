/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const cardContainerRule = /^<docs-card-container>(.*?)<\/docs-card-container>/s;
export const docsCardContainerExtension = {
  name: 'docs-card-container',
  level: 'block',
  start(src) {
    return src.match(/^\s*<docs-card-container/m)?.index;
  },
  tokenizer(src) {
    const match = cardContainerRule.exec(src);
    if (match) {
      const body = match[1];
      const token = {
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
  renderer(token) {
    return `
    <div class="docs-card-grid">
      ${this.parser.parse(token.tokens)}
    </div>
    `;
  },
};
//# sourceMappingURL=docs-card-container.mjs.map
