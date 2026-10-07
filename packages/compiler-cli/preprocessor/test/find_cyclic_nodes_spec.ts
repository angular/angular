/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {findCyclicNodes} from '../src/hybrid_compiler.js';

function graphOf(edges: Record<number, number[]>): Map<number, Set<number>> {
  const graph = new Map<number, Set<number>>();
  for (const [node, targets] of Object.entries(edges)) {
    graph.set(Number(node), new Set(targets));
  }
  return graph;
}

describe('findCyclicNodes', () => {
  it('should report nothing for an acyclic graph', () => {
    expect(findCyclicNodes(graphOf({1: [2, 3], 2: [3], 3: []}))).toEqual(new Set());
  });

  it('should report every node of a simple cycle', () => {
    expect(findCyclicNodes(graphOf({1: [2], 2: [3], 3: [1]}))).toEqual(new Set([1, 2, 3]));
  });

  it('should report a self-edge', () => {
    // A node pointing at itself is a cycle, but its strongly connected component has one
    // member, so component size alone does not catch it.
    expect(findCyclicNodes(graphOf({1: [1], 2: [1]}))).toEqual(new Set([1]));
  });

  it('should report both cycles when they overlap on a shared node', () => {
    // Once `2` has been popped off the recursion stack and left in `visited`,
    // the `2 -> 4 -> 2` cycle is still discovered while closing `1 -> 2 -> 3 -> 1`.
    expect(findCyclicNodes(graphOf({1: [2], 2: [3, 4], 3: [1], 4: [2]}))).toEqual(
      new Set([1, 2, 3, 4]),
    );
  });
});
