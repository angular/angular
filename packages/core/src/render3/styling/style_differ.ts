/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {ArrayMap, ArrayMap3, arrayInsert4, arrayMap3IndexOf, arrayMapIndexOf, arrayMapSet, arrayRemove} from '../../util/array_utils';
import {assertEqual} from '../../util/assert';
import {CharCode as Char} from '../../util/char_code';



/**
 * Stores changes to Style values.
 * Values:
 *   - multiple of 4 + 0: `string` style key.
 *   - multiple of 4 + 1: `boolean|null` style operation to perform:
 *      - `true`: set style
 *      - `false`: remove style
 *      - `null`: do nothing.
 *   - multiple of 4 + 2: `string|null` key original value (or null if it was added).
 *   - multiple of 4 + 3: `string|null` key new value (or null if it was removed).
 */
export type StyleChangesArrayMap = ArrayMap3<string|null, string|null, boolean|null>;

/**
 * See: `StyleChangesArrayMap`
 */
export const enum StyleChangesArrayMapEnum {
  key = 0,
  operation = 1,
  oldValue = 2,
  newValue = 3,
}

/**
 * Computes the diff between two style strings.
 *
 * Example:
 *  `oldValue` => `"a: 1; b: 2, c: 3"`
 *  `newValue` => `"b: 2; c: 4; d: 5;"`
 * will result in:
 * ```
 * changes = [
 *   'a', false,  '1', null,
 *   'b',  null,  '2',  '2',
 *   'c',  true,  '3',  '4',
 *   'd',  true, null,  '5',
 * ]
 * ``
 *
 * @param oldValue Previous style string.
 * @param newValue New style string.
 * @returns `StyleChangesArrayMap`.
 */
export function computeStyleChanges(oldValue: string, newValue: string): StyleChangesArrayMap {
  const changes: StyleChangesArrayMap = [] as any;
  parseKeyValue(oldValue, changes, false);
  parseKeyValue(newValue, changes, true);
  return changes;
}

/**
 * Splits the style list into array, ignoring whitespace and add it to corresponding categories
 * (addition/removals).
 *
 * @param text Style list to split
 * @param parts Where the parts will be stored
 * @param changes Where changes will be stored.
 * @param isNewValue `true` if parsing new value (effects how values get added to `changes`)
 */
export function parseKeyValue(
    text: string, changes: StyleChangesArrayMap, isNewValue: boolean): void {
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
      i = parseStyleValue(changes, token, text, i, isNewValue);
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
 * Processes the key by adding it to either `removals` or `additions` array.
 *
 * @param removals Array which will be populated with keys which require removal after
 *        reconciliation.
 * @param additions Array which will be populated with keys which require addition after
 *        reconciliation.
 * @param key Style key.
 * @param text original text
 * @param index index of `text` where the parsing should start
 * @param isNewValue true if `key`/`value` should be processed as new value.
 * @returns end of value associated with the index.
 */
export function parseStyleValue(
    changes: StyleChangesArrayMap, key: string, text: string, index: number,
    isNewValue: boolean): number {
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
            // As long as we have whitespace characters just adjust the starting location and go
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
          appendStyleKeyValue(changes, key, text.substring(start, end), isNewValue);
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
  appendStyleKeyValue(changes, key, text.substring(start, end), isNewValue);
  return text.length;
}

/**
 * Appends style `key`/`value` information into the list of `removal`/`additions`.
 *
 * Once all of the parsing is complete, the `removal`/`additions` will contain a
 * set of operations which need to be performed on the DOM to reconcile it.
 *
 * @param changes An `ArrayMap3` which tracks changes.
 * @param key Style key to be added to the `removal`/`additions`.
 * @param value Style value to be added to the `removal`/`additions`.
 * @param isNewValue true if `key`/`value` should be processed as new value.
 */
export function appendStyleKeyValue(
    changes: StyleChangesArrayMap, key: string, value: string, isNewValue: boolean): void {
  const index = arrayMap3IndexOf(changes, key);
  if (isNewValue) {
    // This code path is executed when we are iteration over new values.
    if (index < 0) {
      // New key we have not seen before
      arrayInsert4(changes, ~index, key, true, null, value);
    } else {
      // Key we have seen before, see if it is different.
      const oldValue = changes[index | 1] as string;
      changes[index | StyleChangesArrayMapEnum.operation] = oldValue === value ? null : true;
      changes[index | StyleChangesArrayMapEnum.newValue] = value;
    }
  } else {
    // This code path is executed when we are iterating over previous values.
    if (index < 0) {
      // Key we have not seen before
      arrayInsert4(changes, ~index, key, false, value, null);
    } else {
      // Already seen, update value.
      changes[index | StyleChangesArrayMapEnum.oldValue] = value;
    }
  }
}