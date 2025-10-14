/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {normalize} from 'path';
// TODO(josephperrott): Determine how we can define/know the image content base path.
const imageContentBasePath = 'unknown';
export function imageRender({href, title, text}) {
  const isRelativeSrc = href?.startsWith('./');
  const src = isRelativeSrc ? `${imageContentBasePath}/${normalize(href)}` : href;
  return `
  <img src="${src}" alt="${text}" title="${title}" class="docs-image">
  `;
}
//# sourceMappingURL=image.mjs.map
