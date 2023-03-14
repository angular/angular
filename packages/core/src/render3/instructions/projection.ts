/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {newArray} from '../../util/array_utils';
import {TAttributes, TElementNode, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {ProjectionSlots} from '../interfaces/projection';
import {DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, HYDRATION, T_HOST} from '../interfaces/view';
import {applyProjection} from '../node_manipulation';
import {getProjectAsAttrValue, isNodeMatchingSelectorList, isSelectorInSelectorList} from '../node_selector_matcher';
import {getLView, getTView, isInSkipHydrationBlock, setCurrentTNodeAsNotParent} from '../state';

import {getOrCreateTNode} from './shared';



/**
 * Checks a given node against matching projection slots and returns the
 * determined slot index. Returns "null" if no slot matched the given node.
 *
 * This function takes into account the parsed ngProjectAs selector from the
 * node's attributes. If present, it will check whether the ngProjectAs selector
 * matches any of the projection slot selectors.
 */
export function matchingProjectionSlotIndex(tNode: TNode, projectionSlots: ProjectionSlots): number|
    null {
  let wildcardNgContentIndex = null;
  const ngProjectAsAttrVal = getProjectAsAttrValue(tNode);
  for (let i = 0; i < projectionSlots.length; i++) {
    const slotValue = projectionSlots[i];
    // The last wildcard projection slot should match all nodes which aren't matching
    // any selector. This is necessary to be backwards compatible with view engine.
    if (slotValue === '*') {
      wildcardNgContentIndex = i;
      continue;
    }
    // If we ran into an `ngProjectAs` attribute, we should match its parsed selector
    // to the list of selectors, otherwise we fall back to matching against the node.
    if (ngProjectAsAttrVal === null ?
            isNodeMatchingSelectorList(tNode, slotValue, /* isProjectionMode */ true) :
            isSelectorInSelectorList(ngProjectAsAttrVal, slotValue)) {
      return i;  // first matching selector "captures" a given node
    }
  }
  return wildcardNgContentIndex;
}

/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param projectionSlots? A collection of projection slots. A projection slot can be based
 *        on a parsed CSS selectors or set to the wildcard selector ("*") in order to match
 *        all nodes which do not match any selector. If not specified, a single wildcard
 *        selector projection slot will be defined.
 *
 * @codeGenApi
 */
export function ɵɵprojectionDef(projectionSlots?: ProjectionSlots): void {
  const componentNode = getLView()[DECLARATION_COMPONENT_VIEW][T_HOST] as TElementNode;

  if (!componentNode.projection) {
    // If no explicit projection slots are defined, fall back to a single
    // projection slot with the wildcard selector.
    const numProjectionSlots = projectionSlots ? projectionSlots.length : 1;
    const projectionHeads: (TNode|null)[] = componentNode.projection =
        newArray(numProjectionSlots, null! as TNode);
    const tails: (TNode|null)[] = projectionHeads.slice();

    let componentChild: TNode|null = componentNode.child;

    while (componentChild !== null) {
      const slotIndex =
          projectionSlots ? matchingProjectionSlotIndex(componentChild, projectionSlots) : 0;

      if (slotIndex !== null) {
        if (tails[slotIndex]) {
          tails[slotIndex]!.projectionNext = componentChild;
        } else {
          projectionHeads[slotIndex] = componentChild;
        }
        tails[slotIndex] = componentChild;
      }

      componentChild = componentChild.next;
    }
  }
}


/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex
 * @param selectorIndex:
 *        - 0 when the selector is `*` (or unspecified as this is the default value),
 *        - 1 based index of the selector from the {@link projectionDef}
 *
 * @codeGenApi
 */
export function ɵɵprojection(
    nodeIndex: number, selectorIndex: number = 0, attrs?: TAttributes): void {
  const lView = getLView();
  const tView = getTView();
  const tProjectionNode =
      getOrCreateTNode(tView, HEADER_OFFSET + nodeIndex, TNodeType.Projection, null, attrs || null);

  // We can't use viewData[HOST_NODE] because projection nodes can be nested in embedded views.
  if (tProjectionNode.projection === null) tProjectionNode.projection = selectorIndex;

  // `<ng-content>` has no content
  setCurrentTNodeAsNotParent();

  const hydrationInfo = lView[HYDRATION];
  const isNodeCreationMode = !hydrationInfo || isInSkipHydrationBlock();
  if (isNodeCreationMode &&
      (tProjectionNode.flags & TNodeFlags.isDetached) !== TNodeFlags.isDetached) {
    // re-distribution of projectable nodes is stored on a component's view level
    applyProjection(tView, lView, tProjectionNode);
  }
}
