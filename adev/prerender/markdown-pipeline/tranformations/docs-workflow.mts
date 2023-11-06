/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {transformHeader} from './header.mjs';
interface DocsWorkflowToken extends marked.Tokens.Generic {
  type: 'docs-workflow';
  steps: string;
  tokens: marked.Token[];
}

// Capture group 1: all content between the open and close tags
const workflowRule = /^<docs-workflow>(.*?)<\/docs-workflow>/s;

export const docsWorkflowExtension = {
  name: 'docs-workflow',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-workflow/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsWorkflowToken | undefined {
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
  renderer(this: marked.RendererThis, token: DocsWorkflowToken) {
    return `
    <ol class="docs-steps">
      ${this.parser.parse(token.tokens)}
    </ol>
    `;
  },
};

interface DocsStepToken extends marked.Tokens.Generic {
  type: 'docs-step';
  title: string;
  body: string;
  tokens: marked.Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const stepRule = /^\s*<docs-step([^>]*)>((?:.(?!\/docs-step))*)<\/docs-step>/s;
const titleRule = /title="([^"]*)"/;

export const docsStepExtension = {
  name: 'docs-step',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-step/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsStepToken | undefined {
    const match = stepRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const body = match[2].trim();

      const token: DocsStepToken = {
        type: 'docs-step',
        raw: match[0],
        title: title ? title[1] : '',
        body: body,
        tokens: [],
      };
      this.lexer.blockTokens(token.body, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsStepToken) {
    return `
    <li>
      <span class="docs-step-number" aria-hidden="true"></span>
      ${transformHeader(token.title, 3)}
      ${this.parser.parse(token.tokens)}
    </li>
    `;
  },
};
