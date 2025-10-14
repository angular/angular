/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Capture group 1: all content between the open and close tags
const workflowRule = /^<docs-workflow>(.*?)<\/docs-workflow>/s;
export const docsWorkflowExtension = {
  name: 'docs-workflow',
  level: 'block',
  start(src) {
    return src.match(/^\s*<docs-workflow/m)?.index;
  },
  tokenizer(src) {
    const match = workflowRule.exec(src);
    if (match) {
      const steps = match[1];
      const token = {
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
  renderer(token) {
    return `
    <ol class="docs-steps">
      ${this.parser.parse(token.tokens)}
    </ol>
    `;
  },
};
//# sourceMappingURL=docs-workflow.mjs.map
