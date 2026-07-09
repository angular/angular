/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {anchorTarget} from '../helpers.mjs';
import {Renderer, Tokens} from 'marked';

/**
 * Tracks whether the current renderer is inside a link.
 *
 * This is necessary because nested links are invalid HTML and can cause rendering issues.
 */
let insideLink = false;
export function setInsideLink(value: boolean) {
  insideLink = value;
}

export function linkRender(this: Renderer, {href, title, tokens}: Tokens.Link) {
  if (insideLink) {
    return this.parser.parseInline(tokens);
  }

  const titleAttribute = title ? ` title="${title}"` : '';
  // Disable auto-linking while rendering the link's content so that a code symbol used as the
  // link text (e.g. [`httpResource`](/guide/http/http-resource)) isn't turned into a nested
  // anchor pointing at the API reference, which would override the explicit link.
  const previousDisableAutoLinking = this.context.disableAutoLinking;
  this.context.disableAutoLinking = true;
  const content = this.parser.parseInline(tokens);
  this.context.disableAutoLinking = previousDisableAutoLinking;
  return `<a href="${href}"${titleAttribute}${anchorTarget(href)}>${content}</a>`;
}
