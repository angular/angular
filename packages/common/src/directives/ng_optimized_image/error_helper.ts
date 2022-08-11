/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Assembles directive details string, useful for error messages.
export function imgDirectiveDetails(rawSrc: string, includeRawSrc = true) {
  const rawSrcInfo =
      includeRawSrc ? `(activated on an <img> element with the \`rawSrc="${rawSrc}"\`) ` : '';
  return `The NgOptimizedImage directive ${rawSrcInfo}has detected that`;
}
