/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {anchorTarget} from '../helpers.mjs';
import {Renderer, Tokens} from 'marked';

export function linkRender(this: Renderer, {href, title, tokens}: Tokens.Link) {
  const titleAttribute = title ? ` title=${title}` : '';
  return `<a href="${href}"${titleAttribute}${anchorTarget(href)}>${this.parser.parseInline(tokens)}</a>`;
}
