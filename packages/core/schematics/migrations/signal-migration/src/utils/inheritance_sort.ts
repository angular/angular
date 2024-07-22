/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GraphNode, InheritanceGraph} from './inheritance_graph';

/**
 * Sorts the inheritance graph topologically, so that
 * classes without incoming edges are returned first.
 *
 * I.e. The returned list is sorted, so that dependencies
 * of a given class are guaranteed to be included at
 * an earlier position than the inspected class.
 *
 * This sort is helpful for detecting inheritance problems
 * for the migration in simpler ways, without having to
 * check in both directions (base classes, and derived classes).
 */
export function topologicalSort(graph: InheritanceGraph) {
  // All classes without incoming edges.
  const S = Array.from(graph.classParents.keys()).filter(
    (n) => !graph.parentToChildren.has(n) || graph.parentToChildren.get(n)!.length === 0,
  );
  const result: GraphNode[] = [];
  const classParents = new Map(graph.classParents);
  const parentToChildren = new Map(graph.parentToChildren);

  while (S.length) {
    const node = S.pop()!;
    result.push(node);
    for (const next of classParents.get(node) ?? []) {
      // Remove edge from "node -> next".
      classParents.set(
        node,
        classParents.get(node)!.filter((n) => n !== next),
      );
      // Remove edge from "next -> node". Do not modify original array as it might
      // be the one from the original graph
      const newParentToChildrenForNext = [...parentToChildren.get(next)!];
      newParentToChildrenForNext.splice(newParentToChildrenForNext.indexOf(node), 1);
      parentToChildren.set(next, newParentToChildrenForNext);

      // if there are no incoming edges for `next`. add it to `S`.
      if (parentToChildren.get(next)!.length === 0) {
        S.push(next);
      }
    }
  }
  return result;
}
