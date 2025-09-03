/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, Token, TokenizerThis, RendererThis} from 'marked';
import {JSDOM} from 'jsdom';

/** Marked token for a multifile custom docs element. */
export interface DocsCodeMultifileToken extends Tokens.Generic {
  type: 'docs-code-multifile';
  // The example path used for linking to Stackblitz or rendering a preview
  path: string | undefined;
  // The raw nested Markdown of <docs-code> examples in the multifile example
  panes: string;
  // The DocsCodeToken of the nested <docs-code> examples
  paneTokens: Token[];
  // True if we should display preview
  preview: boolean;
  /** Whether to hide code example by default. */
  hideCode: boolean;
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const multiFileCodeRule = /^\s*<docs-code-multifile(.*?)>(.*?)<\/docs-code-multifile>/s;

const pathRule = /path="([^"]*)"/;
const previewRule = /preview/;
const hideCodeRule = /hideCode/;

export const docsCodeMultifileExtension = {
  name: 'docs-code-multifile',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-code-multifile/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCodeMultifileToken | undefined {
    const match = multiFileCodeRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const path = pathRule.exec(attr);
      const preview = previewRule.exec(attr) ? true : false;
      const hideCode = hideCodeRule.exec(attr) ? true : false;

      const token: DocsCodeMultifileToken = {
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
  renderer(this: RendererThis, token: DocsCodeMultifileToken) {
    const el = JSDOM.fragment(`
    <div class="docs-code-multifile">
    ${this.parser.parse(token.paneTokens)}
    </div>
    `).firstElementChild!;

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
