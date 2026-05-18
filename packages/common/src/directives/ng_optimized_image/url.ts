/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Converts a string that represents a URL into a URL class instance.
export function getUrl(src: string, win: Window): URL {
  // Reject protocol-relative URLs (e.g., //evil.com) as they can be exploited
  // for URL injection attacks. These URLs inherit the protocol from the base URL,
  // potentially allowing attackers to redirect requests to external domains.
  if (src.startsWith('//')) {
    throw new Error('Protocol-relative URLs are not allowed in ngOptimizedImage');
  }
  // Don't use a base URL if the URL is absolute.
  return isAbsoluteUrl(src) ? new URL(src) : new URL(src, win.location.href);
}

// Checks whether a URL is absolute (i.e. starts with `http://`, `https://`, or `//`).
// Protocol-relative URLs (//...) are considered absolute because they resolve
// to external domains when processed by the browser.
export function isAbsoluteUrl(src: string): boolean {
  return /^(https?:\/\/|\/\/)/.test(src);
}

// Given a URL, extract the hostname part.
// If a URL is a relative one - the URL is returned as is.
// Protocol-relative URLs (//...) are rejected as they pose security risks.
export function extractHostname(url: string): string {
  if (url.startsWith('//')) {
    throw new Error('Protocol-relative URLs are not allowed in ngOptimizedImage');
  }
  return isAbsoluteUrl(url) ? new URL(url).hostname : url;
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
