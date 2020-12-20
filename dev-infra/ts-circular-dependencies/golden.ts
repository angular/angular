/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  return refs
      .map(
          // Normalize cycles as the paths can vary based on which node in the cycle is visited
          // first in the analyzer. The paths represent cycles. Hence we can shift nodes in a
          // deterministic way so that the goldens don't change unnecessarily and cycle comparison
          // is simpler.
          chain => normalizeCircularDependency(
              chain.map(({fileName}) => convertPathToForwardSlash(relative(baseDir, fileName)))))
      // Sort cycles so that the golden doesn't change unnecessarily when cycles are detected
      // in different order (e.g. new imports cause cycles to be detected earlier or later).
      .sort(compareCircularDependency);
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

/**
 * Normalizes the a circular dependency by ensuring that the path starts with the first
 * node in alphabetical order. Since the path array represents a cycle, we can make a
 * specific node the first element in the path that represents the cycle.
 *
 * This method is helpful because the path of circular dependencies changes based on which
 * file in the path has been visited first by the analyzer. e.g. Assume we have a circular
 * dependency represented as: `A -> B -> C`. The analyzer will detect this cycle when it
 * visits `A`. Though when a source file that is analyzed before `A` starts importing `B`,
 * the cycle path will detected as `B -> C -> A`. This represents the same cycle, but is just
 * different due to a limitation of using a data structure that can be written to a text-based
 * golden file.
 *
 * To account for this non-deterministic behavior in goldens, we shift the circular
 * dependency path to the first node based on alphabetical order. e.g. `A` will always
 * be the first node in the path that represents the cycle.
 */
function normalizeCircularDependency(path: CircularDependency): CircularDependency {
  if (path.length <= 1) {
    return path;
  }

  let indexFirstNode: number = 0;
  let valueFirstNode: string = path[0];

  // Find a node in the cycle path that precedes all other elements
  // in terms of alphabetical order.
  for (let i = 1; i < path.length; i++) {
    const value = path[i];
    if (value.localeCompare(valueFirstNode, 'en') < 0) {
      indexFirstNode = i;
      valueFirstNode = value;
    }
  }

  // If the alphabetically first node is already at start of the path, just
  // return the actual path as no changes need to be made.
  if (indexFirstNode === 0) {
    return path;
  }

  // Move the determined first node (as of alphabetical order) to the start of a new
  // path array. The nodes before the first node in the old path are then concatenated
  // to the end of the new path. This is possible because the path represents a cycle.
  return [...path.slice(indexFirstNode), ...path.slice(0, indexFirstNode)];
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

/**
 * Compares two circular dependencies by respecting the alphabetic order of nodes in the
 * cycle paths. The first nodes which don't match in both paths are decisive on the order.
 */
function compareCircularDependency(a: CircularDependency, b: CircularDependency): number {
  // Go through nodes in both cycle paths and determine whether `a` should be ordered
  // before `b`. The first nodes which don't match decide on the order.
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const compareValue = a[i].localeCompare(b[i], 'en');
    if (compareValue !== 0) {
      return compareValue;
    }
  }
  // If all nodes are equal in the cycles, the order is based on the length of both cycles.
  return a.length - b.length;
}
