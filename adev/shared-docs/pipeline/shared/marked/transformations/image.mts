/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {normalize} from 'path';

import {Renderer} from 'marked';
import type {DocsImage} from '../extensions/docs-image.mjs';

// TODO(josephperrott): Determine how we can define/know the image content base path.
const imageContentBasePath = 'unknown';

export function imageRender(this: Renderer, token: DocsImage) {
  const {href, title, text, loading, decoding, fetchpriority} = token;

  const isRelativeSrc = href?.startsWith('./');
  const src = isRelativeSrc ? `${imageContentBasePath}/${normalize(href)}` : href;

  const attrs = [
    `src="${src}"`,
    `alt="${text}"`,
    `class="docs-image"`,
    title ? `title="${title}"` : null,
    loading ? `loading="${loading}"` : null,
    decoding ? `decoding="${decoding}"` : null,
    fetchpriority ? `fetchpriority="${fetchpriority}"` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return `
  <img ${attrs}>
  `;
}
