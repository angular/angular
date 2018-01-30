/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// The functions in this file verify that the assumptions we are making
// about state in an instruction are correct before implementing any logic.
// They are meant only to be called in dev mode as sanity checks.

/**
 * Stringifies values such that strings are wrapped in explicit quotation marks and
 * other types are stringified normally. Used in error messages (e.g. assertThrow)
 * to make it clear that certain values are of the string type when comparing.
 *
 * e.g. `expected "3" to be 3` is easier to understand than `expected 3 to be 3`.
 *
 * @param value The value to be stringified
 * @returns The stringified value
 */
function stringifyValueForError(value: any): string {
  if (value && value.native && value.native.outerHTML) {
    return value.native.outerHTML;
  }
  return typeof value === 'string' ? `"${value}"` : value;
}

export function assertNumber(actual: any, name: string) {
  (typeof actual != 'number') && assertThrow(actual, 'number', name, 'typeof ==');
}

export function assertEqual<T>(
    actual: T, expected: T, name: string, serializer?: ((v: T) => string)) {
  (actual != expected) && assertThrow(actual, expected, name, '==', serializer);
}

export function assertLessThan<T>(actual: T, expected: T, name: string) {
  (actual >= expected) && assertThrow(actual, expected, name, '<');
}

export function assertNotNull<T>(actual: T, name: string) {
  assertNotEqual(actual, null, name);
}

export function assertNotEqual<T>(actual: T, expected: T, name: string) {
  (actual == expected) && assertThrow(actual, expected, name, '!=');
}

/**
 * Throws an error with a message constructed from the arguments.
 *
 * @param actual The actual value (e.g. 3)
 * @param expected The expected value (e.g. 5)
 * @param name The name of the value being checked (e.g. attrs.length)
 * @param operator The comparison operator (e.g. <, >, ==)
 * @param serializer Function that maps a value to its display value
 */
export function assertThrow<T>(
    actual: T, expected: T, name: string, operator: string,
    serializer: ((v: T) => string) = stringifyValueForError): never {
  const error =
      `ASSERT: expected ${name} ${operator} ${serializer(expected)} but was ${serializer(actual)}!`;
  debugger;  // leave `debugger` here to aid in debugging.
  throw new Error(error);
}
