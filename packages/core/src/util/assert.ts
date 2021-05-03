/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// The functions in this file verify that the assumptions we are making
// about state in an instruction are correct before implementing any logic.
// They are meant only to be called in dev mode as sanity checks.

import {stringify} from './stringify';

export function assertNumber(actual: any, msg: string): asserts actual is number {
  if (!(typeof actual === 'number')) {
    throwError(msg, typeof actual, 'number', '===');
  }
}

export function assertNumberInRange(
    actual: any, minInclusive: number, maxInclusive: number): asserts actual is number {
  assertNumber(actual, 'Expected a number');
  assertLessThanOrEqual(actual, maxInclusive, 'Expected number to be less than or equal to');
  assertGreaterThanOrEqual(actual, minInclusive, 'Expected number to be greater than or equal to');
}

export function assertString(actual: any, msg: string): asserts actual is string {
  if (!(typeof actual === 'string')) {
    throwError(msg, actual === null ? 'null' : typeof actual, 'string', '===');
  }
}

export function assertFunction(actual: any, msg: string): asserts actual is Function {
  if (!(typeof actual === 'function')) {
    throwError(msg, actual === null ? 'null' : typeof actual, 'function', '===');
  }
}

export function assertEqual<T>(actual: T, expected: T, msg: string) {
  if (!(actual == expected)) {
    throwError(msg, actual, expected, '==');
  }
}

export function assertNotEqual<T>(actual: T, expected: T, msg: string): asserts actual is T {
  if (!(actual != expected)) {
    throwError(msg, actual, expected, '!=');
  }
}

export function assertSame<T>(actual: T, expected: T, msg: string): asserts actual is T {
  if (!(actual === expected)) {
    throwError(msg, actual, expected, '===');
  }
}

export function assertNotSame<T>(actual: T, expected: T, msg: string) {
  if (!(actual !== expected)) {
    throwError(msg, actual, expected, '!==');
  }
}

export function assertLessThan<T>(actual: T, expected: T, msg: string): asserts actual is T {
  if (!(actual < expected)) {
    throwError(msg, actual, expected, '<');
  }
}

export function assertLessThanOrEqual<T>(actual: T, expected: T, msg: string): asserts actual is T {
  if (!(actual <= expected)) {
    throwError(msg, actual, expected, '<=');
  }
}

export function assertGreaterThan<T>(actual: T, expected: T, msg: string): asserts actual is T {
  if (!(actual > expected)) {
    throwError(msg, actual, expected, '>');
  }
}

export function assertGreaterThanOrEqual<T>(
    actual: T, expected: T, msg: string): asserts actual is T {
  if (!(actual >= expected)) {
    throwError(msg, actual, expected, '>=');
  }
}

export function assertNotDefined<T>(actual: T, msg: string) {
  if (actual != null) {
    throwError(msg, actual, null, '==');
  }
}

export function assertDefined<T>(actual: T|null|undefined, msg: string): asserts actual is T {
  if (actual == null) {
    throwError(msg, actual, null, '!=');
  }
}

export function throwError(msg: string): never;
export function throwError(msg: string, actual: any, expected: any, comparison: string): never;
export function throwError(msg: string, actual?: any, expected?: any, comparison?: string): never {
  throw new Error(
      `ASSERTION ERROR: ${msg}` +
      (comparison == null ? '' : ` [Expected=> ${expected} ${comparison} ${actual} <=Actual]`));
}

export function assertDomNode(node: any): asserts node is Node {
  // If we're in a worker, `Node` will not be defined.
  if (!(typeof Node !== 'undefined' && node instanceof Node) &&
      !(typeof node === 'object' && node != null &&
        node.constructor.name === 'WebWorkerRenderNode')) {
    throwError(`The provided value must be an instance of a DOM Node but got ${stringify(node)}`);
  }
}


export function assertIndexInRange(arr: any[], index: number) {
  assertDefined(arr, 'Array must be defined.');
  const maxLen = arr.length;
  if (index < 0 || index >= maxLen) {
    throwError(`Index expected to be less than ${maxLen} but got ${index}`);
  }
}


export function assertOneOf(value: any, ...validValues: any[]) {
  if (validValues.indexOf(value) !== -1) return true;
  throwError(`Expected value to be one of ${JSON.stringify(validValues)} but was ${
      JSON.stringify(value)}.`);
}