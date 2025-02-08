/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (Array.isArray(token)) {
    return '[' + token.map(stringify).join(', ') + ']';
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();

  if (res == null) {
    return '' + res;
  }

  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

/**
 * Concatenates two strings with separator, allocating new strings only when necessary.
 *
 * @param before before string.
 * @param separator separator string.
 * @param after after string.
 * @returns concatenated string.
 */
export function concatStringsWithSpace(before: string | null, after: string | null): string {
  return before == null || before === ''
    ? after === null
      ? ''
      : after
    : after == null || after === ''
      ? before
      : before + ' ' + after;
}

/**
 * Ellipses the string in the middle when longer than the max length
 *
 * @param string
 * @param maxLength of the output string
 * @returns ellipsed string with ... in the middle
 */
export function truncateMiddle(str: string, maxLength = 100): string {
  if (!str || maxLength < 1 || str.length <= maxLength) return str;
  if (maxLength == 1) return str.substring(0, 1) + '...';

  const halfLimit = Math.round(maxLength / 2);
  return str.substring(0, halfLimit) + '...' + str.substring(str.length - halfLimit);
}
