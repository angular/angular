/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const LEADING_SLASHES_REGEX = /^[/\\]+/;

/**
 * Regular expression to check if a URL is absolute or protocol-relative.
 * It matches URLs that start with a scheme (e.g., https:) followed by
 * either double forward slashes (//) or double backward slashes (\\).
 * See: https://url.spec.whatwg.org/#absolute-url
 */
const ABSOLUTE_OR_PROTOCOL_RELATIVE_REGEX = /^[a-zA-Z][a-zA-Z0-9+.\-]*:(\/\/|\\\\)/;

/**
 * Parses and validates a URL if it is absolute or protocol-relative.
 * @returns The parsed WHATWG URL object if it is a valid absolute URL, or `null` if it is relative/non-absolute.
 * @throws An Error if the URL is structured as absolute but cannot be parsed by the WHATWG standard.
 */
export function parseAndValidateAbsoluteUrl(url: string): URL | null {
  if (!ABSOLUTE_OR_PROTOCOL_RELATIVE_REGEX.test(url)) {
    return null;
  }

  try {
    return new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Validates the URL string and returns a standardized WHATWG absolute URL string
 * or a normalized relative path.
 */
export function getSafeUrl(url: string | undefined): string | undefined {
  if (typeof url !== 'string') {
    return undefined;
  }

  const parsedUrl = parseAndValidateAbsoluteUrl(url);
  if (parsedUrl !== null) {
    return parsedUrl.href;
  }

  return '/' + url.replace(LEADING_SLASHES_REGEX, '');
}
