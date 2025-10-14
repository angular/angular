/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// The functions in this file verify that the assumptions we are making
// about state in an instruction are correct before implementing any logic.
// They are meant only to be called in dev mode as sanity checks.
import {getActiveConsumer} from '../../primitives/signals';
import {stringify} from './stringify';
export function assertNumber(actual, msg) {
  if (!(typeof actual === 'number')) {
    throwError(msg, typeof actual, 'number', '===');
  }
}
export function assertNumberInRange(actual, minInclusive, maxInclusive) {
  assertNumber(actual, 'Expected a number');
  assertLessThanOrEqual(actual, maxInclusive, 'Expected number to be less than or equal to');
  assertGreaterThanOrEqual(actual, minInclusive, 'Expected number to be greater than or equal to');
}
export function assertString(actual, msg) {
  if (!(typeof actual === 'string')) {
    throwError(msg, actual === null ? 'null' : typeof actual, 'string', '===');
  }
}
export function assertFunction(actual, msg) {
  if (!(typeof actual === 'function')) {
    throwError(msg, actual === null ? 'null' : typeof actual, 'function', '===');
  }
}
export function assertEqual(actual, expected, msg) {
  if (!(actual == expected)) {
    throwError(msg, actual, expected, '==');
  }
}
export function assertNotEqual(actual, expected, msg) {
  if (!(actual != expected)) {
    throwError(msg, actual, expected, '!=');
  }
}
export function assertSame(actual, expected, msg) {
  if (!(actual === expected)) {
    throwError(msg, actual, expected, '===');
  }
}
export function assertNotSame(actual, expected, msg) {
  if (!(actual !== expected)) {
    throwError(msg, actual, expected, '!==');
  }
}
export function assertLessThan(actual, expected, msg) {
  if (!(actual < expected)) {
    throwError(msg, actual, expected, '<');
  }
}
export function assertLessThanOrEqual(actual, expected, msg) {
  if (!(actual <= expected)) {
    throwError(msg, actual, expected, '<=');
  }
}
export function assertGreaterThan(actual, expected, msg) {
  if (!(actual > expected)) {
    throwError(msg, actual, expected, '>');
  }
}
export function assertGreaterThanOrEqual(actual, expected, msg) {
  if (!(actual >= expected)) {
    throwError(msg, actual, expected, '>=');
  }
}
export function assertNotDefined(actual, msg) {
  if (actual != null) {
    throwError(msg, actual, null, '==');
  }
}
export function assertDefined(actual, msg) {
  if (actual == null) {
    throwError(msg, actual, null, '!=');
  }
}
export function throwError(msg, actual, expected, comparison) {
  throw new Error(
    `ASSERTION ERROR: ${msg}` +
      (comparison == null ? '' : ` [Expected=> ${expected} ${comparison} ${actual} <=Actual]`),
  );
}
export function assertDomNode(node) {
  if (!(node instanceof Node)) {
    throwError(`The provided value must be an instance of a DOM Node but got ${stringify(node)}`);
  }
}
export function assertElement(node) {
  if (!(node instanceof Element)) {
    throwError(`The provided value must be an element but got ${stringify(node)}`);
  }
}
export function assertIndexInRange(arr, index) {
  assertDefined(arr, 'Array must be defined.');
  const maxLen = arr.length;
  if (index < 0 || index >= maxLen) {
    throwError(`Index expected to be less than ${maxLen} but got ${index}`);
  }
}
export function assertOneOf(value, ...validValues) {
  if (validValues.indexOf(value) !== -1) return true;
  throwError(
    `Expected value to be one of ${JSON.stringify(validValues)} but was ${JSON.stringify(value)}.`,
  );
}
export function assertNotReactive(fn) {
  if (getActiveConsumer() !== null) {
    throwError(`${fn}() should never be called in a reactive context.`);
  }
}
//# sourceMappingURL=assert.js.map
