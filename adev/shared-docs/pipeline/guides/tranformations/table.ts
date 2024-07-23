/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererApi} from 'marked';

export const tableRender: RendererApi['table'] = (header, body) => {
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
};
