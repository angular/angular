/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer as MarkedRenderer} from 'marked';
import {codeToHtml} from '../shiki/shiki';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: Partial<MarkedRenderer> = {
  code(code: string, language: string, isEscaped: boolean): string {
    const highlightResult = codeToHtml(code, language)
      // remove spaces/line-breaks between elements to not mess-up `pre` style
      .replace(/>\s+</g, '><');

    return `
      <div class="docs-code" role="group">
        <pre class="docs-mini-scroll-track">
          ${highlightResult}
        </pre>
      </div>
    `;
  },
  image(href: string | null, title: string | null, text: string): string {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="docs-image">
    `;
  },
  link(href: string, title: string, text: string): string {
    return `<a href="${href}">${text}</a>`;
  },
  list(body: string, ordered: boolean, start: number) {
    if (ordered) {
      return `
      <ol class="docs-ordered-list">
        ${body}
      </ol>
      `;
    }
    return `
    <ul class="docs-list">
      ${body}
    </ul>
    `;
  },
  table(header: string, body: string): string {
    return `
      <div class="docs-table docs-scroll-track-transparent">
        <table>
          <thead>
            ${header}
          </thead>
          <tbody>
            ${body}
          </tbody>
        </table>
      </div>
    `;
  },
};
