/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Joins two parts of a URL with a slash if needed.
 *
 * @param start  URL string
 * @param end    URL string
 *
 *
 * @returns The joined URL string.
 */
export function joinWithSlash(start: string, end: string) {
  // If `start` is an empty string, return `end` as the result.
  if (!start) return end;
  // If `end` is an empty string, return `start` as the result.
  if (!end) return start;
  // If `start` ends with a slash, remove the leading slash from `end`.
  if (start.endsWith('/')) {
    return end.startsWith('/') ? start + end.slice(1) : start + end;
  }
  // If `start` doesn't end with a slash, add one if `end` doesn't start with a slash.
  return end.startsWith('/') ? start + end : `${start}/${end}`;
}

/**
 * Removes a trailing slash from a URL string if needed.
 * Looks for the first occurrence of either `#`, `?`, or the end of the
 * line as `/` characters and removes the trailing slash if one exists.
 *
 * @param url URL string.
 *
 * @returns The URL string, modified if needed.
 */
export function stripTrailingSlash(url: string): string {
  // Find the index of the first occurrence of `#`, `?`, or the end of the string.
  // This marks the start of the query string, fragment, or the end of the URL path.
  const pathEndIdx = url.search(/#|\?|$/);
  // Check if the character before `pathEndIdx` is a trailing slash.
  // If it is, remove the trailing slash and return the modified URL.
  // Otherwise, return the URL as is.
  return url[pathEndIdx - 1] === '/' ? url.slice(0, pathEndIdx - 1) + url.slice(pathEndIdx) : url;
}

/**
 * Normalizes URL parameters by prepending with `?` if needed.
 *
 * @param  params String of URL parameters.
 *
 * @returns The normalized URL parameters string.
 */
export function normalizeQueryParams(params: string): string {
  return params && params[0] !== '?' ? `?${params}` : params;
}
