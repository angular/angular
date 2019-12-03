/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {ArrayMap3, arrayInsert4, arrayMap3IndexOf} from '../../util/array_utils';
import {consumeStyleKey, consumeStyleKeySeparator, consumeStyleValue, consumeStyleValueSeparator, consumeWhitespace} from './styling_parser';


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
  const end = text.length;
  let start = 0;
  while (start < end) {
    const keyStart = consumeWhitespace(text, start, end);
    const keyEnd = consumeStyleKey(text, keyStart, end);
    if (keyEnd === keyStart) {
      // we reached an end so just quit
      break;
    }
    const valueStart = consumeStyleKeySeparator(text, keyEnd, end);
    const valueEnd = consumeStyleValue(text, valueStart, end);
    if (valueStart !== valueEnd) {
      start = consumeStyleValueSeparator(text, valueEnd, end);
      const key = text.substring(keyStart, keyEnd);
      const value = text.substring(valueStart, valueEnd);
      processStyleKeyValue(changes, key, value, isNewValue);
    } else {
      // We don't have a value, this style is malformed, error.
      throw new Error('Malformed style: ' + text);
    }
  }
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
function processStyleKeyValue(
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

/**
 * Removes a style from a `cssText` string.
 *
 * @param cssText A string which contains styling.
 * @param styleToRemove A style (and its value) to remove from `cssText`.
 * @returns a new style text which does not have `styleToRemove` (and its value)
 */
export function removeStyle(cssText: string, styleToRemove: string): string {
  let start = 0;
  let end = cssText.length;
  while (start < end) {
    const possibleKeyIndex = cssText.indexOf(styleToRemove, start);
    if (possibleKeyIndex === -1) {
      // we did not find anything, so just bail.
      break;
    }
    while (start < possibleKeyIndex + 1) {
      const keyStart = consumeWhitespace(cssText, start, end);
      const keyEnd = consumeStyleKey(cssText, keyStart, end);
      if (keyEnd === keyStart) {
        // we reached the end
        return cssText;
      }
      const valueStart = consumeStyleKeySeparator(cssText, keyEnd, end);
      const valueEnd = consumeStyleValue(cssText, valueStart, end);
      if (valueStart !== valueEnd) {
        const valueEndSep = consumeStyleValueSeparator(cssText, valueEnd, end);
        if (keyStart == possibleKeyIndex && keyEnd === possibleKeyIndex + styleToRemove.length) {
          cssText = cssText.substring(0, keyStart) + cssText.substring(valueEndSep, end);
          end = cssText.length;
          start = keyStart;
          break;  // rescan
        } else {
          // This was not the item we are looking for, keep going.
          start = valueEndSep;
        }

      } else {
        // We don't have a value, this style is malformed, error.
        throw new Error('Malformed style: ' + cssText);
      }
    }
  }
  return cssText;
}