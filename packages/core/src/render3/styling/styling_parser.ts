/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CharCode} from '../../util/char_code';


/**
 * Consumes all of the whitespace characters.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no whitespace at
 *          that location.)
 */
export function consumeWhitespace(text: string, startIndex: number, endIndex: number): number {
  while (startIndex < endIndex && text.charCodeAt(startIndex) <= CharCode.SPACE) {
    startIndex++;
  }
  return startIndex;
}

/**
 * Consumes all of the non-whitespace characters which are class name.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no non-whitespace
 *          at that location, or if `startIndex === endIndex`.)
 */
export function consumeClassToken(text: string, startIndex: number, endIndex: number): number {
  while (startIndex < endIndex && text.charCodeAt(startIndex) > CharCode.SPACE) {
    startIndex++;
  }
  return startIndex;
}

/**
 * Consumes all of the characters belonging to style token.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no non-whitespace
 *          at that location, or if `startIndex === endIndex`.)
 */
export function consumeStyleKey(text: string, startIndex: number, endIndex: number): number {
  let ch: number;
  while (startIndex < endIndex &&
         ((ch = text.charCodeAt(startIndex)) === CharCode.DASH || ch === CharCode.UNDERSCORE ||
          ((ch & CharCode.UPPER_CASE) >= CharCode.A && (ch & CharCode.UPPER_CASE) <= CharCode.Z))) {
    startIndex++;
  }
  return startIndex;
}

/**
 * Consumes all whitespace and the separator `:` after the style key.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no non-whitespace
 *          at that location, or if `startIndex === endIndex`.)
 */
export function consumeStyleKeySeparator(
    text: string, startIndex: number, endIndex: number): number {
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  if (text.charCodeAt(startIndex++) !== CharCode.COLON) {
    throw new Error(`Expected ':' at index ${startIndex} of: ${text}`);
  }
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  return startIndex;
}


/**
 * Consumes all whitespace and the separator `;` after the style value.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no non-whitespace
 *          at that location, or if `startIndex === endIndex`.)
 */
export function consumeStyleValueSeparator(
    text: string, startIndex: number, endIndex: number): number {
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  if (startIndex < endIndex && text.charCodeAt(startIndex++) !== CharCode.SEMI_COLON) {
    throw new Error(`Expected ';' at index ${startIndex} of: ${text}`);
  }
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  return startIndex;
}

/**
 * Consumes style value honoring `url()` and `""` text.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no non-whitespace
 *          at that location, or if `startIndex === endIndex`.)
 */
export function consumeStyleValue(text: string, startIndex: number, endIndex: number): number {
  let ch1 = -1;  // 1st previous character
  let ch2 = -1;  // 2nd previous character
  let ch3 = -1;  // 3rd previous character
  let i = startIndex;
  let lastChIndex = i;
  while (i < endIndex) {
    const ch: number = text.charCodeAt(i++);
    if (ch === CharCode.SEMI_COLON) {
      return lastChIndex;
    } else if (ch === CharCode.DOUBLE_QUOTE || ch === CharCode.SINGLE_QUOTE) {
      lastChIndex = i = consumeQuotedText(text, ch, i, endIndex);
    } else if (
        startIndex ===
            i - 4 &&  // We have seen only 4 characters so far "URL(" (Ignore "foo_URL()")
        ch3 === CharCode.U &&
        ch2 === CharCode.R && ch1 === CharCode.L && ch === CharCode.OPEN_PAREN) {
      lastChIndex = i = consumeQuotedText(text, CharCode.CLOSE_PAREN, i, endIndex);
    } else if (ch > CharCode.SPACE) {
      // if we have a non-whitespace character than capture its location
      lastChIndex = i;
    }
    ch3 = ch2;
    ch2 = ch1;
    ch1 = ch & CharCode.UPPER_CASE;
  }
  return lastChIndex;
}

/**
 * Consumes all of the quoted characters.
 *
 * @param text Text to scan
 * @param quoteCharCode CharCode of either `"` or `'` quote or `)` for `url(...)`.
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index of next non-whitespace character (May be the same as `start` if no non-whitespace
 *          at that location, or if `startIndex === endIndex`.)
 */
export function consumeQuotedText(
    text: string, quoteCharCode: number, startIndex: number, endIndex: number): number {
  let ch1 = -1;  // 1st previous character
  let index = startIndex;
  while (index < endIndex) {
    const ch = text.charCodeAt(index++);
    if (ch == quoteCharCode && ch1 !== CharCode.BACK_SLASH) {
      return index;
    }
    if (ch == CharCode.BACK_SLASH && ch1 === CharCode.BACK_SLASH) {
      // two back slashes cancel each other out. For example `"\\"` should properly end the
      // quotation. (It should not assume that the last `"` is escaped.)
      ch1 = 0;
    } else {
      ch1 = ch;
    }
  }
  throw new Error(`Unmatched '${String.fromCharCode(quoteCharCode)}' at ${startIndex}: ${text}`);
}
