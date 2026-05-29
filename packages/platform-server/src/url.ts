/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Options for {@link resolveUrl}.
 */
export interface ResolveUrlOptions {
  /**
   * Allow protocol-relative URLs (e.g. `//example.com`).
   */
  allowProtocolRelative?: boolean;
}

/**
 * Resolves a URL string.
 *
 * If an origin is provided, the URL is resolved against it. Otherwise, the URL is parsed as-is.
 * @param urlStr The URL to resolve.
 * @param origin The origin to resolve the URL against.
 * @param options Options for resolving the URL.
 * @returns A resolved URL object.
 */
export function resolveUrl(urlStr: string | undefined): URL | null;
export function resolveUrl(
  urlStr: string | undefined,
  origin: string | URL,
  options?: ResolveUrlOptions,
): URL;
export function resolveUrl(
  urlStr: string | undefined,
  origin?: string | URL,
  options: ResolveUrlOptions = {},
): URL | null {
  if (!urlStr) {
    return origin !== undefined ? new URL('/', origin) : null;
  }

  urlStr = urlStr.trim();

  // Fast-path: if the URL is a valid, standard absolute URL, parse and return it immediately.
  try {
    return new URL(urlStr);
  } catch {}

  // We identify and throw on malformed absolute URLs (like double port).
  // Per the WHATWG URL standard, parsing an input starting with a scheme (like 'http:') against
  // a standard base (like 'http://fake') ignores the base argument and parses strictly as an
  // absolute URL. Since it is malformed, the native URL constructor will throw a validation
  // error. Standard relative/protocol-relative paths parse successfully, allowing the flow to continue.
  if (!URL.canParse(urlStr, 'http://fake')) {
    throw new Error(`Invalid URL: ${urlStr}`);
  }

  if (origin === undefined) {
    return null;
  }

  const {allowProtocolRelative = false} = options;

  // Check if we have a legitimate protocol-relative URL (starts with '//' and not a duplicate/backslash bypass)
  // and we are configured to allow and preserve standard cross-origin protocol-relative requests.
  const isProtocolRelative =
    allowProtocolRelative &&
    urlStr[0] === '/' &&
    urlStr[1] === '/' &&
    urlStr.length > 2 &&
    urlStr[2] !== '/' &&
    urlStr[2] !== '\\';

  if (isProtocolRelative) {
    return new URL(urlStr, origin);
  }

  // Safe relative path preservation: if a relative path has no leading forward or backward slashes,
  // we do not prepend any slash so the native URL constructor can resolve it correctly relative
  // to trailing-slash sub-paths (e.g., 'testing' against 'http://localhost/foo/' -> 'http://localhost/foo/testing').
  const startsWithSlash = urlStr[0] === '/' || urlStr[0] === '\\';
  if (!startsWithSlash) {
    return new URL(urlStr, origin);
  }

  // For other relative inputs starting with slashes, we collapse all consecutive leading forward/backward
  // slashes to a single forward slash. This guarantees consistent same-origin path representation and
  // blocks any hostname hijack or takeover attempts.
  let startIdx = 0;
  while (startIdx < urlStr.length && (urlStr[startIdx] === '/' || urlStr[startIdx] === '\\')) {
    startIdx++;
  }
  const pathWithoutLeadingSlashes = urlStr.slice(startIdx);
  const normalizedPath = '/' + pathWithoutLeadingSlashes;

  return new URL(normalizedPath, origin);
}
