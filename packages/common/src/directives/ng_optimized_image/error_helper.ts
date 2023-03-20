/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Assembles directive details string, useful for error messages.
export function imgDirectiveDetails(ngSrc: string, includeNgSrc = true) {
  const ngSrcInfo =
      includeNgSrc ? `(activated on an <img> element with the \`ngSrc="${ngSrc}"\`) ` : '';
  return `The NgOptimizedImage directive ${ngSrcInfo}has detected that`;
}
