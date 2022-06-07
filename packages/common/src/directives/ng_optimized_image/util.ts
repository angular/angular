/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Converts a string that represents a URL into a URL class instance.
export function getUrl(src: string, win: Window): URL {
  // Don't use a base URL is the URL is absolute.
  return isAbsoluteURL(src) ? new URL(src) : new URL(src, win.location.href);
}

// Checks whether a URL is absolute (i.e. starts with `http://` or `https://`).
export function isAbsoluteURL(src: string): boolean {
  return /^https?:\/\//.test(src);
}

// Assembles directive details string, useful for error messages.
export function imgDirectiveDetails(rawSrc: string) {
  return `The NgOptimizedImage directive (activated on an <img> element ` +
      `with the \`rawSrc="${rawSrc}"\`)`;
}

// Invokes a callback for each element in the array. Also invokes a callback
// recursively for each nested array.
export function deepForEach<T>(input: (T|any[])[], fn: (value: T) => void): void {
  input.forEach(value => Array.isArray(value) ? deepForEach(value, fn) : fn(value));
}

// Given a URL, extract the hostname part.
// If a URL is a relative one - the URL is returned as is.
export function extractHostname(url: string): string {
  if (isAbsoluteURL(url)) {
    const instance = new URL(url);
    return instance.hostname;
  }
  return url;
}
