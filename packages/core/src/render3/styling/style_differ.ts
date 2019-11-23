/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {ArrayMap, arrayMapIndexOf, arrayMapSet, arrayRemove} from '../../util/array_utils';
import {assertEqual} from '../../util/assert';
import {CharCode as Char} from '../../util/char_code';


/**
 * Computes the diff between two class-list strings.
 *
 * Example:
 *  `oldValue` => `"A B C"`
 *  `newValue` => `"A C D"`
 * will result in:
 * `removals = ['B'],
 * `additions = ['D']`
 *
 * @param oldValue Previous class-list string.
 * @param newValue New class-list string.
 * @param removals Array which will be populated with keys which require removal after
 *        reconciliation.
 * @param additions Array which will be populated with keys which require addition after
 *        reconciliation.
 */
export function computeStyleChanges(
    oldValue: string, newValue: string, removals: ArrayMap<string>,
    additions: ArrayMap<string>): void {
  parseKeyValue(oldValue, removals, null);
  parseKeyValue(newValue, removals, additions);
}

/**
 * Splits the class list into array, ignoring whitespace and add it to corresponding categories
 * (addition/removals).
 *
 * @param text Style list to split
 * @param parts Where the parts will be stored
 * @param removals Array which will be populated with keys which require removal after
 *        reconciliation.
 * @param additions Array which will be populated with keys which require addition after
 *        reconciliation.
 * @param duplicates Array which is used as internal state of the algorithm to deal with duplicates
 *        in additions.
 *        - `null` implies that `text` is previous value and is used to populating the `removals`
 *           array.
 *        - `[]` implies that `text` is current value and the array is used to keep track of
 *           duplicates.
 */
export function parseKeyValue(
    text: string, removals: ArrayMap<string>, additions: ArrayMap<string>| null): void {
  let start = 0;    // starting character of key
  let end = start;  // ending character of key, (it can be less than `i` if trailing whitespace)
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch <= Char.SPACE) {
      if (end === start) {
        start = end = i + 1;  // ignore leading whitespace
      }
    } else if (ch === Char.COLON) {
      const token = text.substring(start, end);
      i = parseStyleValue(removals, additions, token, text, i);
      start = end = i + 1;
    } else {
      end = i + 1;
    }
  }
}

/**
 * Parser state.
 */
const enum ParseMode {
  /**
   * Initial state to ignore leading whitespace.
   */
  Space = 0,

  /**
   * Mode after `Space` which contains characters.
   */
  Chars = 1,

  /**
   * `url(...)` mode. In this mode the content of `url( ;: )` can contain special characters which
   * would normally end parsing such as `;` but are consumed until closing parenthesis.
   */
  URL = 2,

  /**
   * `*_QUOTE` mode. In this mode the content of `" ;: ""` can contain special characters which
   * would normally end parsing such as `;` but are consumed until closing quote.
   */
  DOUBLE_QUOTE = 34,  // '"' === Char.DOUBLE_QUOTE,
  SINGLE_QUOTE = 39,  // "'" === Char.SINGLE_QUOTE,
}

/**
 * Precesses the key by adding it to either `removals` or as `additions` array.
 *
 * @param removals Array which will be populated with keys which require removal after
 *        reconciliation.
 * @param additions Array which will be populated with keys which require addition after
 *        reconciliation.
 * @param key Style key.
 * @param text original text
 * @param index index of `text` where the parsing should start
 * @returns end of value associated with the index.
 */
export function parseStyleValue(
    removals: ArrayMap<string>, additions: ArrayMap<string>| null, key: string, text: string,
    index: number): number {
  ngDevMode && assertEqual(text.charCodeAt(index), Char.COLON, 'Expected \':\' at this location.');
  let start = index + 1;  // Value start location (This may get advanced if leading whitespace)
  let end = start;        // Last non-whitespace character.
  let mode: ParseMode = ParseMode.Space;
  let ch1 = 0;  // 1st previous character
  let ch2 = 0;  // 2nd previous character
  let ch3 = 0;  // 3rd previous character
  for (let i = start; i < text.length; i++) {
    let ch = text.charCodeAt(i);
    if (ch >= Char.a && ch <= Char.z) ch = ch & Char.UPPER_CASE;  // Make everything uppercase.
    switch (mode) {
      // We start in this mode. It means that we did not see any characters yet.
      case ParseMode.Space:
      case ParseMode.Chars:
        if (mode === ParseMode.Space) {
          if (ch <= Char.SPACE) {
            // As long as we have whitespace characters just adjust the starting location on go
            // on.
            end = start = i + 1;
            break;
          } else {
            // We now have a real character. Change mode and fall through.
            mode = ParseMode.Chars;
          }
        }
        if (ch === Char.SEMI_COLON) {
          // Means we are done parsing Exit with the current location.
          appendStyleKeyValue(removals, additions, key, text.substring(start, end));
          return i;
        } else if (ch === Char.SINGLE_QUOTE || ch === Char.DOUBLE_QUOTE) {
          mode = ch as unknown as ParseMode;  // Enter Quotation mode.
        } else if (
            start === i - 3 &&  // We have seen only 4 characters so far "URL(" (Ignore "foo_URL()")
            ch3 === Char.U && ch2 === Char.R && ch1 === Char.L && ch === Char.OPEN_PAREN) {
          mode = ParseMode.URL;
        }
        if (ch > Char.SPACE) {
          end = i + 1;  // As long as we have a character advance the end.
        }
        break;
      case ParseMode.URL:
        end = i + 1;  // Include all chars in quotes.
        if (ch === Char.CLOSE_PAREN && ch1 !== Char.BACK_SLASH) {
          // Reached the end of "url(...)", exit.
          mode = ParseMode.Chars;
        }
        break;
      case ParseMode.SINGLE_QUOTE:
      case ParseMode.DOUBLE_QUOTE:
        end = i + 1;  // Include all chars in quotes.
        if (ch === mode && ch1 !== Char.BACK_SLASH) {
          // Reached the end of `'...'` or `"..."`, exit.
          mode = ParseMode.Chars;
        }
        break;
    }
    ch3 = ch2;
    ch2 = ch1;
    ch1 = ch;
  }
  appendStyleKeyValue(removals, additions, key, text.substring(start, end));
  return text.length;
}

/**
 * Appends style `key`/`value` information into the list of `removal`/`additions`.
 *
 * Once all of the parsing is complete, the `removal`/`additions` will contain a
 * set of operations which need to be performed on the DOM to reconcile it.
 *
 * @param removals An `ArrayMap` of style properties which need to be removed.
 * @param additions An `ArrayMap` of style properties which need to be set. (Or `null` if we are
 *        adding to `removals` only. This is used to initialize it with previous values.)
 * @param key Style key to be added to the `removal`/`additions`.
 * @param value Style value to be added to the `removal`/`additions`.
 */
export function appendStyleKeyValue(
    removals: ArrayMap<string>, additions: ArrayMap<string>| null, key: string,
    value: string): void {
  if (additions === null) {
    // This code path is executed when we are iterating over previous values.
    // This means that we store the key/value in `removals` as we assume that
    // they may need to be removed from the DOM.
    arrayMapSet(removals, key, value);
  } else {
    // This code path is executed when we are iteration over new values.
    // This means that we may need to remove tokens in the remove `ArrayMap`.
    const removalIndex = arrayMapIndexOf(removals, key);
    if (removalIndex >= 0) {
      // The removal index already has the key, see if it is the same value
      const removalValue = removals[removalIndex | 1];
      if (removalValue !== value) {
        // We have new value to write.
        arrayMapSet(additions, key, value);
      }
      // In either case (value same or different) we don't need to remove the property as
      // either the value is same or `additions` will overwrite is with new value.
      arrayRemove(removals, removalIndex, 2);
    } else {
      // Removals does not have this key, which means this is a new value.
      arrayMapSet(additions, key, value);
    }
  }
}