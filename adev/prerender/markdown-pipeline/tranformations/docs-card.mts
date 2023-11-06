/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {targetForExternalHref} from './helpers.mjs';
import {PROJECT_FOLDER_PATH} from '../constants.mjs';
import {join} from 'path';
import {readFileSync} from 'fs';

interface DocsCardContainerToken extends marked.Tokens.Generic {
  type: 'docs-card-container';
  cards: string;
  tokens: marked.Token[];
}

const cardContainerRule = /^<docs-card-container>(.*?)<\/docs-card-container>/s;

export const docsCardContainerExtension = {
  name: 'docs-card-container',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-card-container/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCardContainerToken | undefined {
    const match = cardContainerRule.exec(src);

    if (match) {
      const body = match[1];
      const token: DocsCardContainerToken = {
        type: 'docs-card-container',
        raw: match[0],
        cards: body ?? '',
        tokens: [],
      };
      this.lexer.blockTokens(token.cards, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsCardContainerToken) {
    return `
    <div class="docs-card-grid">
      ${this.parser.parse(token.tokens)}
    </div>
    `;
  },
};

interface DocsCardToken extends marked.Tokens.Generic {
  type: 'docs-card';
  title: string;
  body: string;
  link?: string;
  href?: string;
  imgSrc?: string;
  tokens: marked.Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const cardRule = /^[^<]*<docs-card\s([^>]*)>((?:.(?!\/docs-card))*)<\/docs-card>/s;

const titleRule = /title="([^"]*)"/;
const linkRule = /link="([^"]*)"/;
const hrefRule = /href="([^"]*)"/;
const imgSrcRule = /imgSrc="([^"]*)"/;

export const docsCardExtension = {
  name: 'docs-card',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-card\s*/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCardToken | undefined {
    const match = cardRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const link = linkRule.exec(attr);
      const href = hrefRule.exec(attr);
      const imgSrc = imgSrcRule.exec(attr);

      const body = match[2].trim();

      const token: DocsCardToken = {
        type: 'docs-card',
        raw: match[0],
        title: title ? title[1] : '',
        body: body ?? '',
        href: href ? href[1] : undefined,
        link: link ? link[1] : undefined,
        imgSrc: imgSrc ? imgSrc[1] : undefined,
        tokens: [],
      };
      this.lexer.blockTokens(token.body, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsCardToken) {
    return token.imgSrc ? getCardWithSvgIllustration(this, token) : getStandardCard(this, token);
  },
};

function getStandardCard(renderer: marked.RendererThis, token: DocsCardToken) {
  if (token.href) {
    return `
    <a href="${token.href}" ${targetForExternalHref(token.href)} class="docs-card">
      <div>
        <h3>${token.title}</h3>
        <p>${renderer.parser.parse(token.tokens)}</p>
      </div>
      <span>${token.link ? token.link : 'Learn more'}</span>
    </a>
    `;
  }
  return `
  <div class="docs-card">
    <div>
      <h3>${token.title}</h3>
      <p>${renderer.parser.parse(token.tokens)}</p>
    </div>
    ${token.link ? `<span>${token.link}</span>` : ''}
  </div>
  `;
}

function getCardWithSvgIllustration(renderer: marked.RendererThis, token: DocsCardToken) {
  // We can assume that all illustrations are svg files
  // We need to read svg content, instead of renering svg with `img`,
  // cause we would like to use CSS variables to support dark and light mode.
  const illustration = getSvgIllustration(token.imgSrc!);

  if (token.href) {
    return `
      <a href="${token.href}" ${targetForExternalHref(
      token.href,
    )} class="docs-card docs-card-with-svg">
        ${illustration}
        <div class="docs-card-text-content">
          <div>
            <h3>${token.title}</h3>
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
      <h3>${token.title}</h3>
      ${renderer.parser.parse(token.tokens)}
      </div>
    </div>
    `;
}

function getSvgIllustration(path: string): string {
  return readFileSync(join(PROJECT_FOLDER_PATH, path), {encoding: 'utf-8'});
}
