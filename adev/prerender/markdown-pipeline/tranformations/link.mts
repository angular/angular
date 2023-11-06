/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {targetForExternalHref} from './helpers.mjs';

export function transformLink(href: string | null, title: string | null, text: string) {
  return `<a href="${href}" ${title ? `title=${title}` : ''} ${targetForExternalHref(
    href,
  )}>${text}</a>`;
}
