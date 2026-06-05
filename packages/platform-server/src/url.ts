/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from './errors';

/**
 * Matches http: or https:
 */
const HTTP_OR_HTTPS_PROTOCOL_REGEX = /^https?:/i;

/**
 * Options for {@link parseUrl}.
 */
export interface ParseUrlOptions {
  /**
   * Allow protocol-relative URLs (e.g. `//example.com`).
   * @default false
   */
  allowProtocolRelative?: boolean;
  /**
   * Allow origin changes.
   * @default true
   */
  allowOriginChange?: boolean;
}

/**
 * Parses a URL string and returns a resolved WHATWG URL object.
 * If no origin is provided, it parses and returns the URL only if it is a valid absolute URL;
 * otherwise it returns `null` (or throws if the URL is a malformed absolute URL).
 * If an origin is provided, relative URLs and protocol-relative URLs are normalized and resolved against it.
 */
export function parseUrl(urlStr: string | undefined): URL | null;
export function parseUrl(
  urlStr: string | undefined,
  origin: string | URL,
  options?: ParseUrlOptions,
): URL;
export function parseUrl(
  urlStr: string | undefined,
  origin?: string | URL,
  options: ParseUrlOptions = {},
): URL | null {
  const originUrl = typeof origin === 'string' ? new URL('/', origin) : origin;

  if (!urlStr) {
    return originUrl || null;
  }

  urlStr = urlStr.trim();

  // Fast-path: if the URL is a valid, standard absolute URL, parse and return it immediately.
  let resolved: URL | undefined;
  try {
    resolved = new URL(urlStr);
  } catch {}
  const {allowProtocolRelative = false, allowOriginChange = true} = options;

  if (resolved) {
    if (originUrl && !isSafeOriginChange(resolved, originUrl, urlStr, allowOriginChange)) {
      throwSuspiciousUrlError(urlStr);
    }

    return resolved;
  }

  // We identify and throw on malformed absolute URLs (like double port).
  // Per the WHATWG URL standard, parsing an input starting with a scheme (like 'http:') against
  // a standard base (like 'http://fake') ignores the base argument and parses strictly as an
  // absolute URL. Since it is malformed, the native URL constructor will throw a validation
  // error. Standard relative/protocol-relative paths parse successfully, allowing the flow to continue.
  if (!URL.canParse(urlStr, 'http://fake')) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_URL,
      ngDevMode ? `Invalid URL: ${urlStr}` : urlStr,
    );
  }

  if (!originUrl) {
    return null;
  }

  // Check if we have a legitimate protocol-relative URL (starts with '//' and not a duplicate/backslash bypass)
  // and we are configured to allow and preserve standard cross-origin protocol-relative requests.
  if (urlStr.startsWith('//')) {
    if (!allowProtocolRelative) {
      throw new RuntimeError(
        RuntimeErrorCode.PROTOCOL_RELATIVE_URL_NOT_ALLOWED,
        ngDevMode
          ? `Protocol relative URLs are not allowed in this context. URL: ${urlStr}`
          : urlStr,
      );
    }

    return new URL(urlStr, origin);
  }

  resolved = new URL(urlStr, origin);

  if (!isSafeOriginChange(resolved, originUrl, urlStr, allowOriginChange)) {
    throwSuspiciousUrlError(urlStr);
  }

  return resolved;
}

/**
 * Throws a suspicious URL error indicating a security bypass attempt.
 */
function throwSuspiciousUrlError(urlStr: string): never {
  throw new RuntimeError(
    RuntimeErrorCode.SUSPICIOUS_URL_CHANGE_ORIGIN,
    ngDevMode
      ? `URL ${urlStr} changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.`
      : urlStr,
  );
}

/**
 * Checks if the origin has changed in a safe way.
 *
 * @param resolved The resolved URL.
 * @param origin The origin URL.
 * @param urlStr The URL string.
 * @param allowOriginChange Whether to allow origin changes.
 * @returns True if the origin has changed in a safe way, false otherwise.
 */
function isSafeOriginChange(
  resolved: URL,
  origin: URL,
  urlStr: string,
  allowOriginChange: boolean,
): boolean {
  if (origin.origin === resolved.origin) {
    return true;
  }

  if (!allowOriginChange) {
    return false;
  }

  return HTTP_OR_HTTPS_PROTOCOL_REGEX.test(urlStr);
}
