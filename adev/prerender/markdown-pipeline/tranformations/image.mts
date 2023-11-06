/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {normalize} from 'path';

// TODO: Make sure we're setting up correct image optimization
export function transformImage(href: string | null, title: string | null, text: string) {
  const src = href?.startsWith('./') ? `assets/content/${normalize(href)}` : href;
  return `
  <img src="${src}" alt="${text}" title="${title}" class="docs-image">
  `;
}
