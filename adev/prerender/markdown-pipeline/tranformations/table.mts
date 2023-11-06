/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function transformDocsTable(header: string, body: string) {
  return `
  <div class="docs-table adev-scroll-track-transparent">
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
}
