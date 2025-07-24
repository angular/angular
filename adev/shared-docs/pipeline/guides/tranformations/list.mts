/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer, Tokens} from 'marked';

export function listRender(this: Renderer, {items, ordered}: Tokens.List) {
  if (ordered) {
    return `
    <ol class="docs-ordered-list">
      ${items.map((item) => this.listitem(item)).join('')}
    </ol>
    `;
  }
  return `
  <ul class="docs-list">
    ${items.map((item) => this.listitem(item)).join('')}
  </ul>
  `;
}
