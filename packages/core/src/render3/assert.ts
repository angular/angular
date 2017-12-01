/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

function stringify(value: any) {
  return typeof value === 'string' ? `"${value}"` : '' + value;
}

export function assertNumber(actual: any, condition: string) {
  (typeof actual != 'number') && assertThrow(actual, 'number', condition, 'typeof ==');
}

export function assertEqual<T>(
    actual: T, expected: T, condition: string, serializer?: ((v: T) => string)) {
  (actual != expected) && assertThrow(actual, expected, condition, '==', serializer);
}

export function assertLessThan<T>(actual: T, expected: T, condition: string) {
  (actual < expected) && assertThrow(actual, expected, condition, '>');
}

export function assertNotNull<T>(actual: T, condition: string) {
  assertNotEqual(actual, null, condition);
}

export function assertNotEqual<T>(actual: T, expected: T, condition: string) {
  (actual == expected) && assertThrow(actual, expected, condition, '!=');
}

export function assertThrow<T>(
    actual: T, expected: T, condition: string, operator: string,
    serializer: ((v: T) => string) = stringify) {
  throw new Error(
      `ASSERT: expected ${condition} ${operator} ${serializer(expected)} but was ${serializer(actual)}!`);
}
