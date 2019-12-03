/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {ArrayMap, arrayInsert2, arrayMapIndexOf, arrayMapSet} from '../../util/array_utils';
import {CharCode} from '../../util/char_code';

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
 * @returns An `ArrayMap` which will be filled with changes.
 *        - `true`: Class needs to be added to the element.
 *        - `false: Class needs to be removed from the element.
 *        - `null`: No change (leave class as is.)
 */
export function computeClassChanges(oldValue: string, newValue: string): ArrayMap<boolean|null> {
  const changes: ArrayMap<boolean|null> = [] as any;
  splitClassList(oldValue, changes, false);
  splitClassList(newValue, changes, true);
  return changes;
}

/**
 * Splits the class list into array, ignoring whitespace and add it to corresponding categories
 * (addition/removals).
 *
 * @param text Class list to split
 * @param changes ArrayMap which will be filled with changes. (`false` - remove; `null` - noop;
 *        `true` - add.)
 * @param isNewValue `true` if we are processing new list.
 */
export function splitClassList(
    text: string, changes: ArrayMap<boolean|null>, isNewValue: boolean): void {
  let start = 0;         // starting character of token
  let hasChars = false;  // If we have seen at least one character.
  let i = 0;
  for (; i < text.length; i++) {
    if (text.charCodeAt(i) <= CharCode.SPACE) {
      if (hasChars) {
        consumeClassToken(changes, text.substring(start, i), isNewValue);
        hasChars = false;
      }
      start = i + 1;
    } else {
      hasChars = true;
    }
  }
  if (hasChars) {
    consumeClassToken(changes, text.substring(start, i), isNewValue);
  }
}

/**
 * Precesses the token by adding it to the `changes` array.
 *
 * @param changes Map which keeps track of what should be done with each value.
 *        - `false` The token should be deleted. (It was in old list, but not in new list.)
 *        - `null` The token should be ignored. (It was present in old list as well as new list.)
 *        - `true` the token should be added. (It was only present in the new value)
 * @param token Token to add to set.
 * @param isNewValue True if invocation represents an addition (removal otherwise.)
 *        - `false` means that we are processing the old value, which may need to be deleted.
 *          Initially all tokens are labeled `false` (remove it.)
 *        - `true` means that we are processing new value which may need to be added. If a token
 *          with same key already exists with `false` then the resulting token is `null` (no
 *          change.) If no token exist than the new token value is `true` (add it.)
 */
export function consumeClassToken(
    changes: ArrayMap<boolean|null>, token: string, isNewValue: boolean) {
  if (isNewValue) {
    // This code path is executed when we are iterating over new values.
    const index = arrayMapIndexOf(changes, token);
    if (index >= 0) {
      const existingTokenValue = changes[index | 1];
      if (existingTokenValue === false) {
        // If the existing value is `false` this means it was in the old list. Because it is in the
        // new list as well we marked it as `null` (noop.)
        changes[index | 1] = null;
      }
    } else {
      // the new list has a token which is not present in the old list. Mark it for addition.
      arrayInsert2(changes, ~index, token, true);
    }
  } else {
    // This code path is executed when we are iterating over previous values.
    // This means that we store the tokens in `changes` with `false` (removals).
    arrayMapSet(changes, token, false);
  }
}
