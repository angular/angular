/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererApi} from 'marked';

export const listRender: RendererApi['list'] = (body, ordered, start) => {
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
};
