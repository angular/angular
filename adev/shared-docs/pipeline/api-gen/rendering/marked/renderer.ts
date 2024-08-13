/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer as MarkedRenderer, Tokens} from 'marked';
import {codeToHtml} from '../shiki/shiki';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: Partial<MarkedRenderer> = {
  code({lang, raw}): string {
    const highlightResult = codeToHtml(raw, lang).replace(/>\s+</g, '><');

    return `
      <div class="docs-code" role="group">
        <pre class="docs-mini-scroll-track">
          ${highlightResult}
        </pre>
      </div>
    `;
  },
  image({href, title, text}): string {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="docs-image">
    `;
  },
  link({href, text}): string {
    return `<a href="${href}">${text}</a>`;
  },
  list({items, ordered, start}) {
    if (ordered) {
      return `
      <ol class="docs-ordered-list">
        ${items}
      </ol>
      `;
    }
    return `
    <ul class="docs-list">
      ${items}
    </ul>
    `;
  },

  table(this: MarkedRenderer, {header, rows}: Tokens.Table) {
    return `
      <div class="docs-table docs-scroll-track-transparent">
        <table>
          <thead>
          ${this.tablerow({
            text: header.map((cell) => this.tablecell(cell)).join(''),
          })}
          </thead>
          <tbody>
          ${rows
            .map((row) =>
              this.tablerow({
                text: row.map((cell) => this.tablecell(cell)).join(''),
              }),
            )
            .join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
