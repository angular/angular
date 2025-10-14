/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {loadWorkspaceRelativeFile, anchorTarget} from '../../helpers.mjs';
import {setInsideLink} from '../../transformations/link.mjs';
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
  start(src) {
    return src.match(/^\s*<docs-card\s*/m)?.index;
  },
  tokenizer(src) {
    const match = cardRule.exec(src);
    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);
      const link = linkRule.exec(attr);
      const href = hrefRule.exec(attr);
      const imgSrc = imgSrcRule.exec(attr);
      const body = match[2].trim();
      const token = {
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
  renderer(token) {
    return token.imgSrc ? getCardWithSvgIllustration(this, token) : getStandardCard(this, token);
  },
};
function getStandardCard(renderer, token) {
  if (token.href) {
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
function parseWithoutCreatingLinks(renderer, token) {
  setInsideLink(true);
  try {
    return renderer.parser.parse(token.tokens);
  } finally {
    setInsideLink(false);
  }
}
function getCardWithSvgIllustration(renderer, token) {
  // We can assume that all illustrations are svg files
  // We need to read svg content, instead of renering svg with `img`,
  // cause we would like to use CSS variables to support dark and light mode.
  const illustration = loadWorkspaceRelativeFile(token.imgSrc);
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
//# sourceMappingURL=docs-card.mjs.map
