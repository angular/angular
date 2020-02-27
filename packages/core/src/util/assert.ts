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

import {stringify} from './stringify';

export function assertNumber(actual: any, msg: string) {
  if (!(typeof actual === 'number')) {
    throwError(msg, typeof actual, 'number', '===');
  }
}

export function assertNumberInRange(actual: any, minInclusive: number, maxInclusive: number) {
  assertNumber(actual, 'Expected a number');
  assertLessThanOrEqual(actual, maxInclusive, 'Expected number to be less than or equal to');
  assertGreaterThanOrEqual(actual, minInclusive, 'Expected number to be greater than or equal to');
}

export function assertString(actual: any, msg: string) {
  if (!(typeof actual === 'string')) {
    throwError(msg, actual === null ? 'null' : typeof actual, 'string', '===');
  }
}

export function assertEqual<T>(actual: T, expected: T, msg: string) {
  if (!(actual == expected)) {
    throwError(msg, actual, expected, '==');
  }
}

export function assertNotEqual<T>(actual: T, expected: T, msg: string) {
  if (!(actual != expected)) {
    throwError(msg, actual, expected, '!=');
  }
}

export function assertSame<T>(actual: T, expected: T, msg: string) {
  if (!(actual === expected)) {
    throwError(msg, actual, expected, '===');
  }
}

export function assertNotSame<T>(actual: T, expected: T, msg: string) {
  if (!(actual !== expected)) {
    throwError(msg, actual, expected, '!==');
  }
}

export function assertLessThan<T>(actual: T, expected: T, msg: string) {
  if (!(actual < expected)) {
    throwError(msg, actual, expected, '<');
  }
}

export function assertLessThanOrEqual<T>(actual: T, expected: T, msg: string) {
  if (!(actual <= expected)) {
    throwError(msg, actual, expected, '<=');
  }
}

export function assertGreaterThan<T>(actual: T, expected: T, msg: string) {
  if (!(actual > expected)) {
    throwError(msg, actual, expected, '>');
  }
}

export function assertGreaterThanOrEqual<T>(actual: T, expected: T, msg: string) {
  if (!(actual >= expected)) {
    throwError(msg, actual, expected, '>=');
  }
}

export function assertNotDefined<T>(actual: T, msg: string) {
  if (actual != null) {
    throwError(msg, actual, null, '==');
  }
}

export function assertDefined<T>(actual: T, msg: string) {
  if (actual == null) {
    throwError(msg, actual, null, '!=');
  }
}

export function throwError(msg: string): never;
export function throwError(msg: string, actual: any, expected: any, comparison: string): never;
export function throwError(msg: string, actual?: any, expected?: any, comparison?: string): never {
  if (ngDevMode && (Error as any).stopInDebuggerOnAssertFailure) {
    // In Angular asserts are consider fatal. During normal application execution they should not
    // happen. When doing development and the dev-tools console is open it is often useful to stop
    // the debugger at this line, so that one can examine the conditions under which these error
    // occur. For this reason if `Error.stopInDebuggerOnAssertFailure = true` then the debugger will
    // stop here. In default case the `Error.stopInDebuggerOnAssertFailure` is not set and so there
    // is no observable behavior to the developer.
    //
    // Notice that the `debugger` statement is only present in `ngDevMode` and is removed in
    // production.
    //
    // tslint:disable-next-line
    debugger;  // Left intentionally for better debugger experience in tests.
  }
  throw new Error(
      `ASSERTION ERROR: ${msg}` +
      (comparison == null ? '' : ` [Expected=> ${expected} ${comparison} ${actual} <=Actual]`));
}

export function assertDomNode(node: any) {
  // If we're in a worker, `Node` will not be defined.
  assertEqual(
      (typeof Node !== 'undefined' && node instanceof Node) ||
          (typeof node === 'object' && node != null &&
           node.constructor.name === 'WebWorkerRenderNode'),
      true, `The provided value must be an instance of a DOM Node but got ${stringify(node)}`);
}


export function assertDataInRange(arr: any[], index: number) {
  const maxLen = arr ? arr.length : 0;
  assertLessThan(index, maxLen, `Index expected to be less than ${maxLen} but got ${index}`);
}
