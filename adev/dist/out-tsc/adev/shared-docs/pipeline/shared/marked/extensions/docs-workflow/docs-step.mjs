/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {formatHeading} from '../../transformations/heading.mjs';
// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const stepRule = /^\s*<docs-step([^>]*)>((?:.(?!\/docs-step))*)<\/docs-step>/s;
const titleRule = /title="([^"]*)"/;
export const docsStepExtension = {
  name: 'docs-step',
  level: 'block',
  start(src) {
    return src.match(/^\s*<docs-step/m)?.index;
  },
  tokenizer(src) {
    const match = stepRule.exec(src);
    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const body = match[2].trim();
      const token = {
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
  renderer(token) {
    return `
    <li>
      <span class="docs-step-number" aria-hidden="true"></span>
      ${formatHeading({text: token.title, depth: 3}, this.parser.renderer.context.markdownFilePath)}
      ${this.parser.parse(token.tokens)}
    </li>
    `;
  },
};
//# sourceMappingURL=docs-step.mjs.map
