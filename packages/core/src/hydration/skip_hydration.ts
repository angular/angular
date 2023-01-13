/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNode} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';

/**
 * The name of an attribute that can be added to the hydration boundary node
 * (component host node) to disable hydration for the content within that boundary.
 */
export const SKIP_HYDRATION_ATTR_NAME = 'ngSkipHydration';

/**
 * Helper function to check if a given node has the 'ngSkipHydration' attribute
 */
export function hasNgSkipHydrationAttr(tNode: TNode): boolean {
  const SKIP_HYDRATION_ATTR_NAME_LOWER_CASE = SKIP_HYDRATION_ATTR_NAME.toLowerCase();

  const attrs = tNode.mergedAttrs;
  if (attrs === null) return false;
  // only ever look at the attribute name and skip the values
  for (let i = 0; i < attrs.length; i += 2) {
    const value = attrs[i];
    // This is a marker, which means that the static attributes section is over,
    // so we can exit early.
    if (typeof value === 'number') return false;
    if (typeof value === 'string' && value.toLowerCase() === SKIP_HYDRATION_ATTR_NAME_LOWER_CASE) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function that determines if a given node is within a skip hydration block
 * by navigating up the TNode tree to see if any parent nodes have skip hydration
 * attribute.
 */
export function isInSkipHydrationBlock(tNode: TNode): boolean {
  let currentTNode: TNode|null = tNode.parent;
  while (currentTNode) {
    if (hasNgSkipHydrationAttr(currentTNode)) {
      return true;
    }
    currentTNode = currentTNode.parent;
  }
  return false;
}
