/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {anchorTarget, isExternalLink} from '../../helpers.mjs';
// Capture group 1: all attributes on the docs-pill tag
const pillRule = /^\s*<docs-pill\s((?:.(?!\n))*)\/>/s;
const titleRule = /title="([^"]*)"/;
const hrefRule = /href="([^"]*)"/;
export const docsPillExtension = {
  name: 'docs-pill',
  level: 'inline',
  start(src) {
    return src.indexOf('<docs-pill ');
  },
  tokenizer(src) {
    const match = pillRule.exec(src);
    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const href = hrefRule.exec(attr);
      const token = {
        type: 'docs-pill',
        raw: match[0],
        title: title ? title[1] : '',
        href: href ? href[1] : '',
        tokens: [],
      };
      this.lexer.inlineTokens(token.title, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(token) {
    return `
    <a class="docs-pill" href="${token.href}"${anchorTarget(token.href)}>
      ${this.parser.parseInline(token.tokens)}${
        isExternalLink(token.href)
          ? '<docs-icon class="docs-icon-small">open_in_new</docs-icon>'
          : ''
      }
    </a>
    `;
  },
};
//# sourceMappingURL=docs-pill.mjs.map
