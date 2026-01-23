/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, Token, TokenizerThis, RendererThis} from 'marked';
import {JSDOM} from 'jsdom';

/** Marked token for tab group component. */
export interface DocsTabGroupToken extends Tokens.Generic {
  type: 'docs-tab-group';
  // The raw nested Markdown of <docs-tab> in the tab group
  tabs: string;
  // The DocsTabToken of the nested <docs-tab>
  tabTokens: Token[];
}

// Capture group 1: all content between the open and close tags
const tabGroupRule = /^\s*<docs-tab-group>(.*?)<\/docs-tab-group>/s;

export const docsTabGroupExtension = {
  name: 'docs-tab-group',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-tab-group/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsTabGroupToken | undefined {
    const match = tabGroupRule.exec(src);

    if (match) {
      const token: DocsTabGroupToken = {
        type: 'docs-tab-group',
        raw: match[0],
        tabs: match[1].trim(),
        tabTokens: [],
      };
      this.lexer.blockTokens(token.tabs, token.tabTokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsTabGroupToken) {
    const el = JSDOM.fragment(`
    <div class="docs-tab-group" style="display: none;">
      ${this.parser.parse(token.tabTokens)}
    </div>
    `).firstElementChild!;

    return el.outerHTML;
  },
};

/** Marked token for tab component. */
export interface DocsTabToken extends Tokens.Generic {
  type: 'docs-tab';
  // The example path used for linking to Stackblitz or rendering a preview
  label: string;
  // The raw nested Markdown of <docs-tab> content in the tab group
  pane: string;
  // The content tokens
  paneTokens: Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const tabRule = /^\s*<docs-tab(.*?)>(.*?)<\/docs-tab>/s;

const labelRule = /label="([^"]*)"/;

export const docsTabExtension = {
  name: 'docs-tab',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-tab/)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsTabToken | undefined {
    const match = tabRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const label = labelRule.exec(attr);

      const token: DocsTabToken = {
        type: 'docs-tab',
        raw: match[0],
        label: label?.[1] ?? '',
        pane: match[2].trim(),
        paneTokens: [],
      };
      this.lexer.blockTokens(token.pane, token.paneTokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsTabToken) {
    const el = JSDOM.fragment(`
    <div class="docs-tab">
      ${this.parser.parse(token.paneTokens)}
    </div>
    `).firstElementChild!;

    el.setAttribute('label', token.label);

    return el.outerHTML;
  },
};
