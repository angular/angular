/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Token, Tokens, RendererThis, TokenizerThis} from 'marked';

interface DocsStepToken extends Tokens.Generic {
  type: 'docs-step';
  body: string;
  tokens: Token[];
  header: Tokens.Heading;
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const stepRule = /^\s*<docs-step([^>]*)>((?:.(?!\/docs-step))*)<\/docs-step>/s;
const titleRule = /title="([^"]*)"/;

export const docsStepExtension = {
  name: 'docs-step',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-step/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsStepToken | undefined {
    const match = stepRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const body = match[2].trim();
      const header = title ? title[1] : '';

      const token: DocsStepToken = {
        type: 'docs-step',
        raw: match[0],
        body: body,
        tokens: [],
        header: {
          text: header,
          raw: header,
          tokens: this.lexer.inlineTokens(header, []),
          type: 'heading',
          depth: 3,
        },
      };
      this.lexer.blockTokens(token.body, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsStepToken) {
    return `
    <li>
      <span class="docs-step-number" aria-hidden="true"></span>
      ${this.parser.renderer.heading(token.header)}
      ${this.parser.parse(token.tokens)}
    </li>
    `;
  },
};
