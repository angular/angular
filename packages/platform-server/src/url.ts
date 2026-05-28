/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const LEADING_SLASHES_REGEX = /^[/\\]+/;
const MALFORMED_ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:(\/\/|\\\\)/;

/**
 * Parses a URL string and returns a resolved WHATWG URL object.
 * If no origin is provided, it parses and returns the URL only if it is a valid absolute URL;
 * otherwise it returns `null` (or throws if the URL is a malformed absolute URL).
 * If an origin is provided, relative URLs and protocol-relative URLs are normalized and resolved against it.
 */
export function parseUrl(urlStr: string | undefined): URL | null;
export function parseUrl(urlStr: string | undefined, origin: string): URL;
export function parseUrl(urlStr: string | undefined, origin?: string): URL | null {
  if (!urlStr) {
    return origin !== undefined ? new URL('/', origin) : null;
  }

  if (URL.canParse(urlStr)) {
    return new URL(urlStr);
  }

  if (MALFORMED_ABSOLUTE_URL_REGEX.test(urlStr)) {
    throw new Error(`Invalid URL: ${urlStr}`);
  }

  if (origin === undefined) {
    return null;
  }

  // Normalizes request path parsing by collapsing multiple consecutive leading slashes
  // and backslashes (e.g. // or /\) down to a single forward slash. This ensures consistent
  // resolution of relative path segments and prevents unexpected absolute path overrides
  // during URL parsing.
  let normalizedPath = urlStr.replace(LEADING_SLASHES_REGEX, '/');
  if (normalizedPath[0] !== '/') {
    normalizedPath = `/${normalizedPath}`;
  }

  return new URL(normalizedPath, origin);
}
