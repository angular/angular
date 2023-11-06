/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {isExternalLink, targetForExternalHref} from './helpers.mjs';

interface DocsPillRowToken extends marked.Tokens.Generic {
  type: 'docs-pill-row';
  pills: string;
  tokens: marked.Token[];
}

// Capture group 1: all content between the open and close tags
const pillRowRule = /^\s*<docs-pill-row>((?:.(?!docs-pill-row))*)<\/docs-pill-row>/s;

export const docsPillRowExtension = {
  name: 'docs-pill-row',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-pill-row/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsPillRowToken | undefined {
    const match = pillRowRule.exec(src);

    if (match) {
      const body = match[1];
      const token: DocsPillRowToken = {
        type: 'docs-pill-row',
        raw: match[0],
        pills: body ?? '',
        tokens: [],
      };
      this.lexer.inlineTokens(token.pills, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsPillRowToken) {
    return `
    <nav class="docs-pill-row">
      ${this.parser.parseInline(token.tokens)}
    </nav>
    `;
  },
};

interface DocsPillToken extends marked.Tokens.Generic {
  type: 'docs-pill';
  title: string;
  href: string;
  tokens: marked.Token[];
}

// Capture group 1: all attributes on the docs-pill tag
const pillRule = /^\s*<docs-pill\s((?:.(?!\n))*)\/>/s;

const titleRule = /title="([^"]*)"/;
const hrefRule = /href="([^"]*)"/;

export const docsPillExtension = {
  name: 'docs-pill',
  level: 'inline',
  start(src: string) {
    return src.indexOf('<docs-pill ');
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsPillToken | undefined {
    const match = pillRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const href = hrefRule.exec(attr);

      const token: DocsPillToken = {
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
  renderer(this: marked.RendererThis, token: DocsPillToken) {
    return `
    <a class="docs-pill" href="${token.href}" ${targetForExternalHref(token.href)}>
      ${this.parser.parseInline(token.tokens)}
      ${
        isExternalLink(token.href)
          ? '<docs-icon class="docs-icon-small">open_in_new</docs-icon>'
          : ''
      }
    </a>
    `;
  },
};
