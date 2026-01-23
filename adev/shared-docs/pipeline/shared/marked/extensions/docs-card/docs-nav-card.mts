/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, Token, RendererThis, TokenizerThis} from 'marked';
import {loadWorkspaceRelativeFile} from '../../helpers.mjs';

interface DocsNavCardToken extends Tokens.Generic {
  type: 'docs-nav-card';
  title: string;
  items: string;
  tokens: Token[];
  iconImgSrc?: string; // Need image since icons are custom
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const navCardRule = /^[^<]*<docs-nav-card\s([^>]*)>((?:.(?!\/docs-nav-card))*)<\/docs-nav-card>/s;
const titleRule = /title="([^"]*)"/;
const hrefRule = /href="([^"]*)"/;
const iconImgSrcRule = /iconImgSrc="([^"]*)"/;

export const docsNavCardExtension = {
  name: 'docs-nav-card',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-nav-card\s*/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsNavCardToken | undefined {
    const match = navCardRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const iconImgSrc = iconImgSrcRule.exec(attr);

      const items = match[2].trim();

      const token: DocsNavCardToken = {
        type: 'docs-nav-card',
        raw: match[0],
        title: title ? title[1] : '',
        items: items ?? '',
        iconImgSrc: iconImgSrc ? iconImgSrc[1] : undefined,
        tokens: [],
      };
      this.lexer.blockTokens(token.items, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsNavCardToken) {
    // We can assume that all icons are svg files since they are custom.
    // We need to read svg content, instead of renering svg with `img`,
    // cause we would like to use CSS variables to support dark and light mode.
    let icon = '';
    if (token.iconImgSrc) {
      icon = loadWorkspaceRelativeFile(token.iconImgSrc);
    }

    return `
      <div class="docs-nav-card">
        <div class="docs-nav-card-title">
          ${icon}
          <h6>${token.title}</h6>
        </div>
        <div class="docs-nav-card-content">
          <div class="docs-nav-card-links">
            ${this.parser.parse(token.tokens)}
          </div>
        </div>
      </div>
    `;
  },
};

interface DocsNavLinkToken extends Tokens.Generic {
  type: 'docs-nav-link';
  title: string;
  body: string;
  href: string;
  iconImgSrc?: string; // Need image since icons are custom
  bodyTokens: Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const navLinkRule = /^[^<]*<docs-nav-link\s([^>]*)>((?:.(?!\/docs-nav-link))*)<\/docs-nav-link>/s;

export const docsNavLinkExtension = {
  name: 'docs-nav-link',
  level: 'block' as const,
  start(src: string) {
    src.match(/^\s*<docs-nav-link/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsNavLinkToken | undefined {
    const match = navLinkRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const iconImgSrc = iconImgSrcRule.exec(attr);
      const href = hrefRule.exec(attr);

      const body = match[2].trim();

      const token: DocsNavLinkToken = {
        type: 'docs-nav-link',
        raw: match[0],
        title: title ? title[1] : '',
        href: href ? href[1] : '',
        body: body ?? '',
        iconImgSrc: iconImgSrc ? iconImgSrc[1] : undefined,
        bodyTokens: [],
      };
      this.lexer.blockTokens(token.body, token.bodyTokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsNavLinkToken) {
    // We can assume that all icons are svg files since they are custom.
    // We need to read svg content, instead of renering svg with `img`,
    // cause we would like to use CSS variables to support dark and light mode.
    let icon = '';
    if (token.iconImgSrc) {
      icon = loadWorkspaceRelativeFile(token.iconImgSrc);
    }

    return `
      <a href="${token.href}" class="docs-card docs-nav-link">
        <div class="docs-card-text-content">
          <div class="docs-nav-link-title">
            ${icon}
            <h3>${token.title}</h3>
          </div>
          ${this.parser.parse(token.bodyTokens)}
        </div>
      </a>
    `;
  },
};
