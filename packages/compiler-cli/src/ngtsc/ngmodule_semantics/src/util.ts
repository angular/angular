/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SemanticSymbol} from './api';

/**
 * Determines whether the provided symbols represent the same declaration.
 */
export function isSymbolEqual(a: SemanticSymbol, b: SemanticSymbol): boolean {
  if (a.decl === b.decl) {
    // If the declaration is identical then it must represent the same symbol.
    return true;
  }

  if (a.identifier === null || b.identifier === null) {
    // Unidentifiable symbols are assumed to be different.
    return false;
  }

  return a.path === b.path && a.identifier === b.identifier;
}

export function referenceEquality<T>(a: T, b: T): boolean {
  return a === b;
}

/**
 * Determines if the provided arrays are equal to each other, using the provided equality tester
 * that is called for all entries in the array.
 */
export function isArrayEqual<T>(
    a: readonly T[]|null, b: readonly T[]|null,
    equalityTester: (a: T, b: T) => boolean = referenceEquality): boolean {
  if (a === null || b === null) {
    return a === b;
  }

  if (a.length !== b.length) {
    return false;
  }

  return !a.some((item, index) => !equalityTester(item, b[index]));
}

/**
 * Determines if the provided sets are equal to each other, using the provided equality tester.
 * Two sets compare equal if they contain exactly the same items, regardless of their order.
 */
export function isSetEqual<T>(
    a: ReadonlySet<T>, b: ReadonlySet<T>, equalityTester: (a: T, b: T) => boolean): boolean {
  if (a.size !== b.size) {
    return false;
  }

  for (const itemA of a) {
    let found = false;
    for (const itemB of b) {
      if (equalityTester(itemA, itemB)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }

  return true;
}
