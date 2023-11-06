/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function transformDocsList(body: string, ordered: boolean) {
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
}
