/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getHeaderId} from '../state.mjs';
import {mapBackticksToCodeElement} from '../utils.mjs';

export function transformHeader(text: string, level: number) {
  // Nested anchor elements are invalid in HTML
  // They might happen when we have a code block in a heading
  // regex aren't perfect for that but this one should be "good enough"
  const regex = /<a\s+(?:[^>]*?\s+)?href.*?>(.*?)<\/a>/gi;
  const anchorLessText = text.replace(regex, '$1');

  const link = getHeaderId(anchorLessText);
  const label = mapBackticksToCodeElement(anchorLessText);

  return `
  <h${level} id="${link}">
    <a href="#${link}" class="docs-anchor" tabindex="-1">${label}</a>
  </h${level}>`;
}
