/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const LEADING_SLASHES_REGEX = /^[/\\]+/;
// Characters silently stripped by the WHATWG URL parser, so they can be used to
// hide a scheme from the malformed-URL guard below.
const URL_STRIPPED_CHARS_REGEX = /[\t\n\r]/g;

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

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:(\/\/|\\\\)/.test(urlStr.replace(URL_STRIPPED_CHARS_REGEX, ''))) {
    throw new Error(`Invalid URL: ${urlStr}`);
  }

  if (origin === undefined) {
    return null;
  }

  let normalizedPath = urlStr.replace(LEADING_SLASHES_REGEX, '/');
  if (normalizedPath[0] !== '/') {
    normalizedPath = `/${normalizedPath}`;
  }

  return new URL(normalizedPath, origin);
}
