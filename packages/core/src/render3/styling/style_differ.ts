/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {concatStringsWithSpace} from '../../util/stringify';
import {consumeWhitespace, getLastParsedKey, getLastParsedValue, parseStyle, parseStyleNext, resetParserState} from './styling_parser';

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
  for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
    processStyleKeyValue(changes, getLastParsedKey(text), getLastParsedValue(text), isNewValue);
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
  if (cssText.indexOf(styleToRemove) === -1) {
    // happy case where we don't need to invoke parser.
    return cssText;
  }
  let lastValueEnd = 0;
  for (let i = parseStyle(cssText); i >= 0; i = parseStyleNext(cssText, i)) {
    const key = getLastParsedKey(cssText);
    if (key === styleToRemove) {
      // Consume any remaining whitespace.
      i = consumeWhitespace(cssText, i, cssText.length);
      if (lastValueEnd === 0) {
        cssText = cssText.substring(i);
        i = 0;
      } else if (i === cssText.length) {
        return cssText.substring(0, lastValueEnd);
      } else {
        cssText = concatStringsWithSpace(cssText.substring(0, lastValueEnd), cssText.substring(i));
        i = lastValueEnd + 1;  // 1 is for ';'.length(so that we skip the separator)
      }
      resetParserState(cssText);
    }
    lastValueEnd = i;
  }
  return cssText;
}
