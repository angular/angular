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
  return isAbsoluteUrl(src) ? new URL(src) : new URL(src, win.location.href);
}

// Checks whether a URL is absolute (i.e. starts with `http://` or `https://`).
export function isAbsoluteUrl(src: string): boolean {
  return /^https?:\/\//.test(src);
}

// Assembles directive details string, useful for error messages.
export function imgDirectiveDetails(rawSrc: string, includeRawSrc = true) {
  const rawSrcInfo =
      includeRawSrc ? `(activated on an <img> element with the \`rawSrc="${rawSrc}"\`) ` : '';
  return `The NgOptimizedImage directive ${rawSrcInfo}has detected that`;
}

// Invokes a callback for each element in the array. Also invokes a callback
// recursively for each nested array.
export function deepForEach<T>(input: (T|any[])[], fn: (value: T) => void): void {
  input.forEach(value => Array.isArray(value) ? deepForEach(value, fn) : fn(value));
}

// Given a URL, extract the hostname part.
// If a URL is a relative one - the URL is returned as is.
export function extractHostname(url: string): string {
  return isAbsoluteUrl(url) ? (new URL(url)).hostname : url;
}

export function isValidPath(path: unknown): boolean {
  const isString = typeof path === 'string';

  if (!isString || path.trim() === '') {
    return false;
  }

  // Calling new URL() will throw if the path string is malformed
  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
}

export function normalizePath(path: string): string {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function normalizeSrc(src: string): string {
  return src.startsWith('/') ? src.slice(1) : src;
}
