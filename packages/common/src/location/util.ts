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
  const match = url.match(/#|\?|$/);
  const pathEndIdx = (match && match.index) || url.length;
  const droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === '/' ? 1 : 0);
  return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
}

/**
 * Normalizes URL parameters by prepending with `?` if needed.
 *
 * @param  params String of URL parameters.
 *
 * @returns The normalized URL parameters string.
 */
export function normalizeQueryParams(params: string): string {
  return params && params[0] !== '?' ? '?' + params : params;
}
