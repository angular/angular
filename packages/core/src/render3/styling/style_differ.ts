/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {CharCode} from '../../util/char_code';
import {consumeSeparator, consumeStyleKey, consumeStyleValue, consumeWhitespace} from './styling_parser';



/**
 * Stores changes to Style values.
 * - `key`: style name.
 * - `value`:
 *   - `old`: previous value (or `null`)
 *   - `new`: new value (or `null`).
 *
 * If `old === new` do nothing.
 * If `old === null` then add `new`.
 * If `new === null` then remove `old`.
 */
export type StyleChangesMap = Map<string, {old: string | null, new: string | null}>;

/**
 * Computes the diff between two style strings.
 *
 * Example:
 *  `oldValue` => `"a: 1; b: 2, c: 3"`
 *  `newValue` => `"b: 2; c: 4; d: 5;"`
 * will result in:
 * ```
 * changes = Map(
 *   'a', { old:  '1', new: null },
 *   'b', { old:  '2', new:  '2' },
 *   'c', { old:  '3', new:  '4' },
 *   'd', { old: null, new:  '5' },
 * )
 * ``
 *
 * @param oldValue Previous style string.
 * @param newValue New style string.
 * @returns `StyleChangesArrayMap`.
 */
export function computeStyleChanges(oldValue: string, newValue: string): StyleChangesMap {
  const changes: StyleChangesMap = new Map<string, {old: string | null, new: string | null}>();
  parseKeyValue(oldValue, changes, false);
  parseKeyValue(newValue, changes, true);
  return changes;
}

/**
 * Splits the style list into array, ignoring whitespace and add it to corresponding categories
 * changes.
 *
 * @param text Style list to split
 * @param changes Where changes will be stored.
 * @param isNewValue `true` if parsing new value (effects how values get added to `changes`)
 */
export function parseKeyValue(text: string, changes: StyleChangesMap, isNewValue: boolean): void {
  const end = text.length;
  let start = 0;
  while (start < end) {
    const keyStart = consumeWhitespace(text, start, end);
    const keyEnd = consumeStyleKey(text, keyStart, end);
    if (keyEnd === keyStart) {
      // we reached an end so just quit
      break;
    }
    const valueStart = consumeSeparator(text, keyEnd, end, CharCode.COLON);
    const valueEnd = consumeStyleValue(text, valueStart, end);
    if (ngDevMode && valueStart === valueEnd) {
      throw malformedStyleError(text, valueStart);
    }
    start = consumeSeparator(text, valueEnd, end, CharCode.SEMI_COLON);
    const key = text.substring(keyStart, keyEnd);
    const value = text.substring(valueStart, valueEnd);
    processStyleKeyValue(changes, key, value, isNewValue);
  }
}

/**
 * Appends style `key`/`value` information into the list of `changes`.
 *
 * Once all of the parsing is complete, the `changes` will contain a
 * set of operations which need to be performed on the DOM to reconcile it.
 *
 * @param changes An `StyleChangesMap which tracks changes.
 * @param key Style key to be added to the `changes`.
 * @param value Style value to be added to the `changes`.
 * @param isNewValue true if `key`/`value` should be processed as new value.
 */
function processStyleKeyValue(
    changes: StyleChangesMap, key: string, value: string, isNewValue: boolean): void {
  if (isNewValue) {
    // This code path is executed when we are iterating over new values.
    const existing = changes.get(key);
    if (existing === undefined) {
      // Key we have not seen before
      changes.set(key, styleKeyValue(null, value));
    } else {
      // Already seen, update value.
      existing.new = value;
    }
  } else {
    // This code path is executed when we are iteration over previous values.
    changes.set(key, styleKeyValue(value, null));
  }
}

function styleKeyValue(oldValue: string | null, newValue: string | null) {
  return {old: oldValue, new: newValue};
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
  let lastValueEnd = 0;
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
      const valueStart = consumeSeparator(cssText, keyEnd, end, CharCode.COLON);
      const valueEnd = consumeStyleValue(cssText, valueStart, end);
      if (ngDevMode && valueStart === valueEnd) {
        throw malformedStyleError(cssText, valueStart);
      }
      const valueEndSep = consumeSeparator(cssText, valueEnd, end, CharCode.SEMI_COLON);
      if (keyStart == possibleKeyIndex && keyEnd === possibleKeyIndex + styleToRemove.length) {
        if (valueEndSep == end) {
          // This is a special case when we are the last key in a list, we then chop off the
          // trailing separator as well.
          cssText = cssText.substring(0, lastValueEnd);
        } else {
          cssText = cssText.substring(0, keyStart) + cssText.substring(valueEndSep, end);
        }
        end = cssText.length;
        start = keyStart;
        break;  // rescan.
      } else {
        // This was not the item we are looking for, keep going.
        start = valueEndSep;
      }
      lastValueEnd = valueEnd;
    }
  }
  return cssText;
}

function malformedStyleError(text: string, index: number) {
  return new Error(
      `Malformed style at location ${index} in string '` + text.substring(0, index) + '[>>' +
      text.substring(index, index + 1) + '<<]' + text.substr(index + 1) + '\'.');
}