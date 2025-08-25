/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer, Tokens} from 'marked';

export function tableRender(this: Renderer, {header, rows}: Tokens.Table) {
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
}
