/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer, Token, Tokens} from 'marked';

export function paragraphRender(this: Renderer, {tokens}: Tokens.Paragraph) {
  let html = '';
  let inlineTokens: Token[] = [];

  const flushInlineTokens = () => {
    const content = this.parser.parseInline(inlineTokens);
    if (content.trim()) {
      html += `<p>${content}</p>\n`;
    }
    inlineTokens = [];
  };

  for (const token of tokens) {
    if (token.type === 'docs-alert') {
      flushInlineTokens();
      html += this.parser.parseInline([token]);
    } else {
      inlineTokens.push(token);
    }
  }
  flushInlineTokens();

  return html;
}
