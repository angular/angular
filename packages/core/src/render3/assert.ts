/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getComponentDef, getNgModuleDef} from './definition';
import {TNode} from './interfaces/node';
import {LView} from './interfaces/view';

// The functions in this file verify that the assumptions we are making
// about state in an instruction are correct before implementing any logic.
// They are meant only to be called in dev mode as sanity checks.

export function assertNumber(actual: any, msg: string) {
  if (typeof actual != 'number') {
    throwError(msg);
  }
}

export function assertEqual<T>(actual: T, expected: T, msg: string) {
  if (actual != expected) {
    throwError(msg);
  }
}

export function assertNotEqual<T>(actual: T, expected: T, msg: string) {
  if (actual == expected) {
    throwError(msg);
  }
}

export function assertSame<T>(actual: T, expected: T, msg: string) {
  if (actual !== expected) {
    throwError(msg);
  }
}

export function assertLessThan<T>(actual: T, expected: T, msg: string) {
  if (actual >= expected) {
    throwError(msg);
  }
}

export function assertGreaterThan<T>(actual: T, expected: T, msg: string) {
  if (actual <= expected) {
    throwError(msg);
  }
}

export function assertNotDefined<T>(actual: T, msg: string) {
  if (actual != null) {
    throwError(msg);
  }
}

export function assertDefined<T>(actual: T, msg: string) {
  if (actual == null) {
    throwError(msg);
  }
}

export function assertComponentType(
    actual: any,
    msg: string =
        'Type passed in is not ComponentType, it does not have \'ngComponentDef\' property.') {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}

export function assertNgModuleType(
    actual: any,
    msg: string =
        'Type passed in is not NgModuleType, it does not have \'ngModuleDef\' property.') {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}

function throwError(msg: string): never {
  // tslint:disable-next-line
  debugger;  // Left intentionally for better debugger experience.
  throw new Error(`ASSERTION ERROR: ${msg}`);
}

export function assertDomNode(node: any) {
  assertEqual(node instanceof Node, true, 'The provided value must be an instance of a DOM Node');
}


export function assertPreviousIsParent(isParent: boolean) {
  assertEqual(isParent, true, 'previousOrParentTNode should be a parent');
}

export function assertHasParent(tNode: TNode) {
  assertDefined(tNode.parent, 'previousOrParentTNode should have a parent');
}

export function assertDataNext(lView: LView, index: number, arr?: any[]) {
  if (arr == null) arr = lView;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
}

export function assertDataInRange(arr: any[], index: number) {
  assertLessThan(index, arr ? arr.length : 0, 'index expected to be a valid data index');
}
