/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, throwError} from '../../util/assert';
import {CharCode} from '../../util/char_code';

/**
 * Stores the locations of key/value indexes while parsing styling.
 *
 * In case of `cssText` parsing the indexes are like so:
 * ```
 *   "key1: value1; key2: value2; key3: value3"
 *                  ^   ^ ^     ^             ^
 *                  |   | |     |             +-- textEnd
 *                  |   | |     +---------------- valueEnd
 *                  |   | +---------------------- value
 *                  |   +------------------------ keyEnd
 *                  +---------------------------- key
 * ```
 *
 * In case of `className` parsing the indexes are like so:
 * ```
 *   "key1 key2 key3"
 *         ^   ^    ^
 *         |   |    +-- textEnd
 *         |   +------------------------ keyEnd
 *         +---------------------------- key
 * ```
 * NOTE: `value` and `valueEnd` are used only for styles, not classes.
 */
interface ParserState {
  textEnd: number;
  key: number;
  keyEnd: number;
  value: number;
  valueEnd: number;
}
// Global state of the parser. (This makes parser non-reentrant, but that is not an issue)
const parserState: ParserState = {
  textEnd: 0,
  key: 0,
  keyEnd: 0,
  value: 0,
  valueEnd: 0,
};

/**
 * Retrieves the last parsed `key` of style.
 * @param text the text to substring the key from.
 */
export function getLastParsedKey(text: string): string {
  return text.substring(parserState.key, parserState.keyEnd);
}

/**
 * Retrieves the last parsed `value` of style.
 * @param text the text to substring the key from.
 */
export function getLastParsedValue(text: string): string {
  return text.substring(parserState.value, parserState.valueEnd);
}

/**
 * Initializes `className` string for parsing and parses the first token.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
 *   const key = getLastParsedKey();
 *   ...
 * }
 * ```
 * @param text `className` to parse
 * @returns index where the next invocation of `parseClassNameNext` should resume.
 */
export function parseClassName(text: string): number {
  resetParserState(text);
  return parseClassNameNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}

/**
 * Parses next `className` token.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
 *   const key = getLastParsedKey();
 *   ...
 * }
 * ```
 *
 * @param text `className` to parse
 * @param index where the parsing should resume.
 * @returns index where the next invocation of `parseClassNameNext` should resume.
 */
export function parseClassNameNext(text: string, index: number): number {
  const end = parserState.textEnd;
  if (end === index) {
    return -1;
  }
  index = parserState.keyEnd = consumeClassToken(text, parserState.key = index, end);
  return consumeWhitespace(text, index, end);
}

/**
 * Initializes `cssText` string for parsing and parses the first key/values.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i))) {
 *   const key = getLastParsedKey();
 *   const value = getLastParsedValue();
 *   ...
 * }
 * ```
 * @param text `cssText` to parse
 * @returns index where the next invocation of `parseStyleNext` should resume.
 */
export function parseStyle(text: string): number {
  resetParserState(text);
  return parseStyleNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}

/**
 * Parses the next `cssText` key/values.
 *
 * This function is intended to be used in this format:
 * ```
 * for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i))) {
 *   const key = getLastParsedKey();
 *   const value = getLastParsedValue();
 *   ...
 * }
 *
 * @param text `cssText` to parse
 * @param index where the parsing should resume.
 * @returns index where the next invocation of `parseStyleNext` should resume.
 */
export function parseStyleNext(text: string, startIndex: number): number {
  const end = parserState.textEnd;
  let index = parserState.key = consumeWhitespace(text, startIndex, end);
  if (end === index) {
    // we reached an end so just quit
    return -1;
  }
  index = parserState.keyEnd = consumeStyleKey(text, index, end);
  index = consumeSeparator(text, index, end, CharCode.COLON);
  index = parserState.value = consumeWhitespace(text, index, end);
  index = parserState.valueEnd = consumeStyleValue(text, index, end);
  return consumeSeparator(text, index, end, CharCode.SEMI_COLON);
}

/**
 * Reset the global state of the styling parser.
 * @param text The styling text to parse.
 */
export function resetParserState(text: string): void {
  parserState.key = 0;
  parserState.keyEnd = 0;
  parserState.value = 0;
  parserState.valueEnd = 0;
  parserState.textEnd = text.length;
}

/**
 * Returns index of next non-whitespace character.
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
 * Returns index of last char in class token.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after last char in class token.
 */
export function consumeClassToken(text: string, startIndex: number, endIndex: number): number {
  while (startIndex < endIndex && text.charCodeAt(startIndex) > CharCode.SPACE) {
    startIndex++;
  }
  return startIndex;
}

/**
 * Consumes all of the characters belonging to style key and token.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after last style key character.
 */
export function consumeStyleKey(text: string, startIndex: number, endIndex: number): number {
  let ch: number;
  while (startIndex < endIndex &&
         ((ch = text.charCodeAt(startIndex)) === CharCode.DASH || ch === CharCode.UNDERSCORE ||
          ((ch & CharCode.UPPER_CASE) >= CharCode.A && (ch & CharCode.UPPER_CASE) <= CharCode.Z) ||
          (ch >= CharCode.ZERO && ch <= CharCode.NINE))) {
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
 * @returns Index after separator and surrounding whitespace.
 */
export function consumeSeparator(
    text: string, startIndex: number, endIndex: number, separator: number): number {
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  if (startIndex < endIndex) {
    if (ngDevMode && text.charCodeAt(startIndex) !== separator) {
      malformedStyleError(text, String.fromCharCode(separator), startIndex);
    }
    startIndex++;
  }
  return startIndex;
}


/**
 * Consumes style value honoring `url()` and `""` text.
 *
 * @param text Text to scan
 * @param startIndex Starting index of character where the scan should start.
 * @param endIndex Ending index of character where the scan should end.
 * @returns Index after last style value character.
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
      // if we have a non-whitespace character then capture its location
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
 * @returns Index after quoted characters.
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
  throw ngDevMode ? malformedStyleError(text, String.fromCharCode(quoteCharCode), endIndex) :
                    new Error();
}

function malformedStyleError(text: string, expecting: string, index: number): never {
  ngDevMode && assertEqual(typeof text === 'string', true, 'String expected here');
  throw throwError(
      `Malformed style at location ${index} in string '` + text.substring(0, index) + '[>>' +
      text.substring(index, index + 1) + '<<]' + text.substr(index + 1) +
      `'. Expecting '${expecting}'.`);
}
