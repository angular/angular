/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, Token, RendererThis, TokenizerThis} from 'marked';
import {loadWorkspaceRelativeFile} from '../../helpers.mjs';
import {formatHeading} from '../../transformations/heading.mjs';

interface DocsCardContainerToken extends Tokens.Generic {
  type: 'docs-card-container';
  cards: string;
  headerTitle?: string;
  headerImgSrc?: string;
  tokens: Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const cardContainerRule =
  /^[^<]*<docs-card-container(?:\s([^>]*))?>((?:.(?!\/docs-card-container))*)<\/docs-card-container>/s;
const headerTitleRule = /headerTitle="([^"]*)"/;
const headerImgSrcRule = /headerImgSrc="([^"]*)"/;

export const docsCardContainerExtension = {
  name: 'docs-card-container',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-card-container/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string): DocsCardContainerToken | undefined {
    const match = cardContainerRule.exec(src);

    if (match) {
      const attr = match[1] ? match[1].trim() : '';
      const headerTitle = headerTitleRule.exec(attr);
      const headerImgSrc = headerImgSrcRule.exec(attr);

      const body = match[2].trim();

      const token: DocsCardContainerToken = {
        type: 'docs-card-container',
        raw: match[0],
        cards: body ?? '',
        headerTitle: headerTitle ? headerTitle[1] : undefined,
        headerImgSrc: headerImgSrc ? headerImgSrc[1] : undefined,
        tokens: [],
      };
      this.lexer.blockTokens(token.cards, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCardContainerToken) {
    return token.headerTitle
      ? getContainerWithHeader(this, token)
      : getStandardContainer(this, token);
  },
};

function getStandardContainer(renderer: RendererThis, token: DocsCardContainerToken) {
  return `
    <div class="docs-card-grid">
      ${renderer.parser.parse(token.tokens)}
    </div>
    `;
}

function getContainerWithHeader(renderer: RendererThis, token: DocsCardContainerToken) {
  // We can assume that all illustrations are svg files
  // We need to read svg content, instead of renering svg with `img`,
  // cause we would like to use CSS variables to support dark and light mode.
  let illustration = token.headerImgSrc ? loadWorkspaceRelativeFile(token.headerImgSrc!) : '';

  return `
    <div class="docs-card-container-wrapper">
      <div class="docs-card-container-header">
        ${formatHeading({text: token.headerTitle!, depth: 2})}
          <span class="header-img">${illustration}</span>
      </div>
      <div class="docs-card-container-content docs-card-grid">
        ${renderer.parser.parse(token.tokens)}
      </div>
    </div>
    `;
}
