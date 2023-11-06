/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const isExternalLink = (href: string | undefined | null) =>
  href?.startsWith('http') ?? false;

export const targetForExternalHref = (href: string | undefined | null) =>
  isExternalLink(href) ? `target="_blank"` : '';
