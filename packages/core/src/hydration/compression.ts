/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NodeNavigationStep, REFERENCE_NODE_BODY, REFERENCE_NODE_HOST} from './interfaces';

/**
 * Regexp that extracts a reference node information from the compressed node location.
 * The reference node is represented as either:
 *  - a number which points to an LView slot
 *  - the `b` char which indicates that the lookup should start from the `document.body`
 *  - the `h` char to start lookup from the component host node (`lView[HOST]`)
 */
const REF_EXTRACTOR_REGEXP =
    new RegExp(`^(\\d+)*(${REFERENCE_NODE_BODY}|${REFERENCE_NODE_HOST})*(.*)`);

/**
 * Helper function that takes a reference node location and a set of navigation steps
 * (from the reference node) to a target node and outputs a string that represents
 * a location.
 *
 * For example, given: referenceNode = 'b' (body) and path = ['firstChild', 'firstChild',
 * 'nextSibling'], the function returns: `bf2n`.
 */
export function compressNodeLocation(referenceNode: string, path: NodeNavigationStep[]): string {
  const result: Array<string|number> = [referenceNode];
  for (const segment of path) {
    const lastIdx = result.length - 1;
    if (lastIdx > 0 && result[lastIdx - 1] === segment) {
      // An empty string in a count slot represents 1 occurrence of an instruction.
      const value = (result[lastIdx] || 1) as number;
      result[lastIdx] = value + 1;
    } else {
      // Adding a new segment to the path.
      // Using an empty string in a counter field to avoid encoding `1`s
      // into the path, since they are implicit (e.g. `f1n1` vs `fn`), so
      // it's enough to have a single char in this case.
      result.push(segment, '');
    }
  }
  return result.join('');
}

/**
 * Helper function that reverts the `compressNodeLocation` and transforms a given
 * string into an array where at 0th position there is a reference node info and
 * after that it contains information (in pairs) about a navigation step and the
 * number of repetitions.
 *
 * For example, the path like 'bf2n' will be transformed to:
 * ['b', 'firstChild', 2, 'nextSibling', 1].
 *
 * This information is later consumed by the code that navigates the DOM to find
 * a given node by its location.
 */
export function decompressNodeLocation(path: string):
    [string|number, ...(number | NodeNavigationStep)[]] {
  const matches = path.match(REF_EXTRACTOR_REGEXP)!;
  const [_, refNodeId, refNodeName, rest] = matches;
  // If a reference node is represented by an index, transform it to a number.
  const ref = refNodeId ? parseInt(refNodeId, 10) : refNodeName;
  const steps: (number|NodeNavigationStep)[] = [];
  // Match all segments in a path.
  for (const [_, step, count] of rest.matchAll(/(f|n)(\d*)/g)) {
    const repeat = parseInt(count, 10) || 1;
    steps.push(step as NodeNavigationStep, repeat);
  }
  return [ref, ...steps];
}
