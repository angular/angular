/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Token, Tokens, RendererThis, TokenizerThis} from 'marked';

interface DocsWorkflowToken extends Tokens.Generic {
  type: 'docs-workflow';
  steps: string;
  tokens: Token[];
}

// Capture group 1: all content between the open and close tags
const workflowRule = /^<docs-workflow>(.*?)<\/docs-workflow>/s;

export const docsWorkflowExtension = {
  name: 'docs-workflow',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-workflow/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsWorkflowToken | undefined {
    const match = workflowRule.exec(src);

    if (match) {
      const steps = match[1];

      const token: DocsWorkflowToken = {
        type: 'docs-workflow',
        raw: match[0],
        steps: steps ?? '',
        tokens: [],
      };
      this.lexer.blockTokens(token.steps, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsWorkflowToken) {
    return `
    <ol class="docs-steps">
      ${this.parser.parse(token.tokens)}
    </ol>
    `;
  },
};
