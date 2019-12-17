/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {assertNotEqual} from '../../util/assert';
import {CharCode} from '../../util/char_code';
import {concatStringsWithSpace} from '../../util/stringify';
import {consumeWhitespace, getLastParsedKey, parseClassName, parseClassNameNext} from './styling_parser';



/**
 * Computes the diff between two class-list strings.
 *
 * Example:
 *  `oldValue` => `"A B C"`
 *  `newValue` => `"A C D"`
 * will result in:
 * ```
 * new Map([
 *   ['A', null],
 *   ['B', false],
 *   ['C', null],
 *   ['D', true]
 * ])
 * ```
 *
 * @param oldValue Previous class-list string.
 * @param newValue New class-list string.
 * @returns A `Map` which will be filled with changes.
 *        - `true`: Class needs to be added to the element.
 *        - `false: Class needs to be removed from the element.
 *        - `null`: No change (leave class as is.)
 */
export function computeClassChanges(oldValue: string, newValue: string): Map<string, boolean|null> {
  const changes = new Map<string, boolean|null>();
  splitClassList(oldValue, changes, false);
  splitClassList(newValue, changes, true);
  return changes;
}

/**
 * Splits the class list into array, ignoring whitespace and add it to corresponding categories
 * `changes`.
 *
 * @param text Class list to split
 * @param changes Map which will be filled with changes. (`false` - remove; `null` - noop;
 *        `true` - add.)
 * @param isNewValue `true` if we are processing new list.
 */
export function splitClassList(
    text: string, changes: Map<string, boolean|null>, isNewValue: boolean): void {
  for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
    processClassToken(changes, getLastParsedKey(text), isNewValue);
  }
}

/**
 * Processes the token by adding it to the `changes` Map.
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
 *          change.) If no token exists then the new token value is `true` (add it.)
 */
export function processClassToken(
    changes: Map<string, boolean|null>, token: string, isNewValue: boolean) {
  if (isNewValue) {
    // This code path is executed when we are iterating over new values.
    const existingTokenValue = changes.get(token);
    if (existingTokenValue === undefined) {
      // the new list has a token which is not present in the old list. Mark it for addition.
      changes.set(token, true);
    } else if (existingTokenValue === false) {
      // If the existing value is `false` this means it was in the old list. Because it is in the
      // new list as well we marked it as `null` (noop.)
      changes.set(token, null);
    }
  } else {
    // This code path is executed when we are iterating over previous values.
    // This means that we store the tokens in `changes` with `false` (removals).
    changes.set(token, false);
  }
}

/**
 * Toggles a class in `className` string.
 *
 * @param className A string containing classes (whitespace separated)
 * @param classToToggle A class name to remove or add to the `className`
 * @param toggle Whether the resulting `className` should contain or not the `classToToggle`
 * @returns a new class-list which does not have `classToRemove`
 */
export function toggleClass(className: string, classToToggle: string, toggle: boolean): string {
  if (className === '') {
    return toggle ? classToToggle : '';
  }
  let start = 0;
  let end = className.length;
  while (start < end) {
    start = classIndexOf(className, classToToggle, start);
    if (start === -1) {
      if (toggle === true) {
        className = concatStringsWithSpace(className, classToToggle);
      }
      break;
    }
    if (toggle === true) {
      // we found it and we should have it so just return
      return className;
    } else {
      const length = classToToggle.length;
      // Cut out the class which should be removed.
      const endWhitespace = consumeWhitespace(className, start + length, end);
      if (endWhitespace === end) {
        // If we are the last token then we need back search trailing whitespace.
        while (start > 0 && className.charCodeAt(start - 1) <= CharCode.SPACE) {
          start--;
        }
      }
      className = className.substring(0, start) + className.substring(endWhitespace, end);
      end = className.length;
    }
  }
  return className;
}

/**
 * Returns an index of `classToSearch` in `className` taking token boundaries into account.
 *
 * `classIndexOf('AB A', 'A', 0)` will be 3 (not 0 since `AB!==A`)
 *
 * @param className A string containing classes (whitespace separated)
 * @param classToSearch A class name to locate
 * @param startingIndex Starting location of search
 * @returns an index of the located class (or -1 if not found)
 */
export function classIndexOf(
    className: string, classToSearch: string, startingIndex: number): number {
  ngDevMode && assertNotEqual(classToSearch, '', 'can not look for "" string.');
  let end = className.length;
  while (true) {
    const foundIndex = className.indexOf(classToSearch, startingIndex);
    if (foundIndex === -1) return foundIndex;
    if (foundIndex === 0 || className.charCodeAt(foundIndex - 1) <= CharCode.SPACE) {
      // Ensure that it has leading whitespace
      const length = classToSearch.length;
      if (foundIndex + length === end ||
          className.charCodeAt(foundIndex + length) <= CharCode.SPACE) {
        // Ensure that it has trailing whitespace
        return foundIndex;
      }
    }
    // False positive, keep searching from where we left off.
    startingIndex = foundIndex + 1;
  }
}