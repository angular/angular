/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererThis, Token, TokenizerThis, Tokens} from 'marked';
import {anchorTarget, loadWorkspaceRelativeFile} from '../../helpers.mjs';
import {AdevDocsRenderer} from '../../renderer.mjs';

interface DocsCardToken extends Tokens.Generic {
  type: 'docs-card';
  title: string;
  body: string;
  link?: string;
  href?: string;
  imgSrc?: string;
  iconImgSrc?: string; // Need image since icons are custom
  tokens: Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const cardRule = /^[^<]*<docs-card(?:\s([^>]*))?>((?:.(?!\/docs-card))*)<\/docs-card>/s;

const titleRule = /title="([^"]*)"/;
const linkRule = /link="([^"]*)"/;
const hrefRule = /href="([^"]*)"/;
const imgSrcRule = /imgSrc="([^"]*)"/;
const iconImgSrcRule = /iconImgSrc="([^"]*)"/;

export const docsCardExtension = {
  name: 'docs-card',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-card\s*/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCardToken | undefined {
    const match = cardRule.exec(src);

    if (match) {
      const attr = match[1] ? match[1].trim() : '';
      const title = titleRule.exec(attr);
      const link = linkRule.exec(attr);
      const href = hrefRule.exec(attr);
      const imgSrc = imgSrcRule.exec(attr);
      const iconImgSrc = iconImgSrcRule.exec(attr);

      const body = match[2].trim();

      const token: DocsCardToken = {
        type: 'docs-card',
        raw: match[0],
        title: title ? title[1] : '',
        body: body ?? '',
        href: href ? href[1] : undefined,
        link: link ? link[1] : undefined,
        imgSrc: imgSrc ? imgSrc[1] : undefined,
        iconImgSrc: iconImgSrc ? iconImgSrc[1] : undefined,
        tokens: [],
      };
      this.lexer.blockTokens(token.body, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCardToken) {
    return token.imgSrc
      ? getCardWithSvgIllustration(this, token)
      : getStandardCard(this.parser.renderer as AdevDocsRenderer, token);
  },
};

function getStandardCard(renderer: AdevDocsRenderer, token: DocsCardToken) {
  if (token.iconImgSrc && token.href) {
    // We can assume that all icons are svg files since they are custom.
    // We need to read svg content, instead of renering svg with `img`,
    // cause we would like to use CSS variables to support dark and light mode.
    const icon = loadWorkspaceRelativeFile(token.iconImgSrc);

    return `
    <a href="${token.href}" ${anchorTarget(token.href)} class="docs-card">
      <div>
        ${icon}
        <h3>${token.title}</h3>
        ${renderer.parser.parse(token.tokens)}
      </div>
      <span>${token.link ? token.link : 'Learn more'}</span>
    </a>
    `;
  } else if (token.href) {
    return `
    <a href="${token.href}" ${anchorTarget(token.href)} class="docs-card">
      <div>
        ${token.title ? `<h3>${token.title}</h3>` : ''}
        ${parseWithoutCreatingLinks(renderer, token)}
      </div>
      <span>${token.link ? token.link : 'Learn more'}</span>
    </a>
    `;
  }
  return `
  <div class="docs-card">
    <div>
      ${token.title ? `<h3>${token.title}</h3>` : ''}
      ${renderer.parser.parse(token.tokens)}
    </div>
    ${token.link ? `<span>${token.link}</span>` : ''}
  </div>
  `;
}

function parseWithoutCreatingLinks(renderer: AdevDocsRenderer, token: DocsCardToken) {
  renderer.context.disableAutoLinking = true;
  const parsed = renderer.parser.parse(token.tokens);
  renderer.context.disableAutoLinking = false;
  return parsed;
}

function getCardWithSvgIllustration(renderer: RendererThis, token: DocsCardToken) {
  // We can assume that all illustrations are svg files
  // We need to read svg content, instead of renering svg with `img`,
  // cause we would like to use CSS variables to support dark and light mode.
  const illustration = loadWorkspaceRelativeFile(token.imgSrc!);

  if (token.href) {
    return `
      <a href="${token.href}" ${anchorTarget(token.href)} class="docs-card docs-card-with-svg">
        ${illustration}
        <div class="docs-card-text-content">
          <div>
            ${token.title ? `<h3>${token.title}</h3>` : ''}
            ${renderer.parser.parse(token.tokens)}
          </div>
          <span>${token.link ? token.link : 'Learn more'}</span>
        </div>
      </a>
      `;
  }
  return `
    <div class="docs-card docs-card-with-svg">
      ${illustration}
      <div class="docs-card-text-content">
      ${token.title ? `<h3>${token.title}</h3>` : ''}
      ${renderer.parser.parse(token.tokens)}
      </div>
    </div>
    `;
}
