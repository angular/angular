/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Converts a string that represents a URL into a URL class instance.
export function getUrl(src: string, win: Window): URL {
  const isAbsolute = /^https?:\/\//.test(src);
  // Don't use a base URL is the URL is absolute.
  return isAbsolute ? new URL(src) : new URL(src, win.location.href);
}

// Assembles directive details string, useful for error messages.
export function imgDirectiveDetails(rawSrc: string) {
  return `The NgOptimizedImage directive (activated on an <img> element ` +
      `with the \`rawSrc="${rawSrc}"\`)`;
}
