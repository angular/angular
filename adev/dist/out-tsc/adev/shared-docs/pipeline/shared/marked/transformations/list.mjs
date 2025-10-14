/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function listRender({items, ordered}) {
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
//# sourceMappingURL=list.mjs.map
