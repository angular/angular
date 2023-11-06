/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {marked} from 'marked';
import {getPageTitle} from './h1.mjs';
import {readFileSync} from 'fs';
import {join} from 'path';
import {PROJECT_FOLDER_PATH} from '../constants.mjs';

interface DocsDecorativeHeaderToken extends marked.Tokens.Generic {
  type: 'docs-decorative-header';
  title: string;
  imgSrc: string;
  body: string;
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const decorativeHeaderRule =
  /^[^<]*<docs-decorative-header\s([^>]*)>((?:.(?!\/docs-decorative-header))*)<\/docs-decorative-header>/s;

const imgSrcRule = /imgSrc="([^"]*)"/;
const titleRule = /title="([^"]*)"/;

export const docsDecorativeHeaderExtension = {
  name: 'docs-decorative-header',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-decorative-header\s*/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsDecorativeHeaderToken | undefined {
    const match = decorativeHeaderRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const body = match[2].trim();

      const imgSrc = imgSrcRule.exec(attr);
      const title = titleRule.exec(attr);

      const token: DocsDecorativeHeaderToken = {
        type: 'docs-decorative-header',
        raw: match[0],
        title: title ? title[1] : '',
        imgSrc: imgSrc ? imgSrc[1] : '../assets/images/globe.svg',
        body: body ?? '',
      };
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsDecorativeHeaderToken) {
    // We can assume that all illustrations are svg files
    // We need to read svg content, instead of renering svg with `img`,
    // cause we would like to use CSS variables to support dark and light mode.
    const illustration = getSvgIllustration(token.imgSrc);

    return `
    <div class="docs-decorative-header-container">
      <div class="docs-decorative-header">
        <div class="docs-header-content">
          <docs-breadcrumb></docs-breadcrumb>

          ${getPageTitle(token.title)}

          <p>${token.body}</p>
        </div>

        <!-- illustration -->
        ${illustration}
      </div>
    </div>
    `;
  },
};

function getSvgIllustration(path: string): string {
  return readFileSync(join(PROJECT_FOLDER_PATH, path), {encoding: 'utf-8'});
}
