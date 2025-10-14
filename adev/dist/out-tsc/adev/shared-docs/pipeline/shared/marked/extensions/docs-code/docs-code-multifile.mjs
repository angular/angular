/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {JSDOM} from 'jsdom';
// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const multiFileCodeRule = /^\s*<docs-code-multifile(.*?)>(.*?)<\/docs-code-multifile>/s;
const pathRule = /path="([^"]*)"/;
const previewRule = /preview/;
const hideCodeRule = /hideCode/;
export const docsCodeMultifileExtension = {
  name: 'docs-code-multifile',
  level: 'block',
  start(src) {
    return src.match(/^\s*<docs-code-multifile/)?.index;
  },
  tokenizer(src) {
    const match = multiFileCodeRule.exec(src);
    if (match) {
      const attr = match[1].trim();
      const path = pathRule.exec(attr);
      const preview = previewRule.exec(attr) ? true : false;
      const hideCode = hideCodeRule.exec(attr) ? true : false;
      const token = {
        type: 'docs-code-multifile',
        raw: match[0],
        path: path?.[1],
        panes: match[2].trim(),
        paneTokens: [],
        preview: preview,
        hideCode,
      };
      this.lexer.blockTokens(token.panes, token.paneTokens);
      return token;
    }
    return undefined;
  },
  renderer(token) {
    const el = JSDOM.fragment(`
    <div class="docs-code-multifile">
    ${this.parser.parse(token.paneTokens)}
    </div>
    `).firstElementChild;
    if (token.path) {
      el.setAttribute('path', token.path);
    }
    if (token.preview) {
      el.setAttribute('preview', `${token.preview}`);
    }
    if (token.hideCode) {
      el.setAttribute('hideCode', 'true');
    }
    return el.outerHTML;
  },
};
//# sourceMappingURL=docs-code-multifile.mjs.map
