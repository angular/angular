/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {relative} from 'path';

import {ReferenceChain} from './analyzer';
import {convertPathToForwardSlash} from './file_system';

export type CircularDependency = ReferenceChain<string>;
export type Golden = CircularDependency[];

/**
 * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
 * by default use TypeScript source file objects. In order to make those chains printable,
 * the source file objects are mapped to their relative file names.
 */
export function convertReferenceChainToGolden(refs: ReferenceChain[], baseDir: string): Golden {
  return refs.map(
      chain => chain.map(({fileName}) => convertPathToForwardSlash(relative(baseDir, fileName))));
}

/**
 * Compares the specified goldens and returns two lists that describe newly
 * added circular dependencies, or fixed circular dependencies.
 */
export function compareGoldens(actual: Golden, expected: Golden) {
  const newCircularDeps: CircularDependency[] = [];
  const fixedCircularDeps: CircularDependency[] = [];
  actual.forEach(a => {
    if (!expected.find(e => isSameCircularDependency(a, e))) {
      newCircularDeps.push(a);
    }
  });
  expected.forEach(e => {
    if (!actual.find(a => isSameCircularDependency(e, a))) {
      fixedCircularDeps.push(e);
    }
  });
  return {newCircularDeps, fixedCircularDeps};
}

/** Checks whether the specified circular dependencies are equal. */
function isSameCircularDependency(actual: CircularDependency, expected: CircularDependency) {
  if (actual.length !== expected.length) {
    return false;
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      return false;
    }
  }
  return true;
}
