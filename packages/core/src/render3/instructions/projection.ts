/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TElementNode, TNode, TNodeType} from '../interfaces/node';
import {CssSelectorList} from '../interfaces/projection';
import {T_HOST} from '../interfaces/view';
import {appendProjectedNodes} from '../node_manipulation';
import {matchingProjectionSelectorIndex} from '../node_selector_matcher';
import {getLView, setIsParent} from '../state';
import {findComponentView} from '../util/view_traversal_utils';
import {createNodeAtIndex} from './shared';

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
 * @param selectors A collection of parsed CSS selectors
 * @param rawSelectors A collection of CSS selectors in the raw, un-parsed form
 *
 * @publicApi
 */
export function ΔprojectionDef(selectors?: CssSelectorList[], textSelectors?: string[]): void {
  const componentNode = findComponentView(getLView())[T_HOST] as TElementNode;

  if (!componentNode.projection) {
    const noOfNodeBuckets = selectors ? selectors.length + 1 : 1;
    const projectionHeads: (TNode | null)[] = componentNode.projection =
        new Array(noOfNodeBuckets).fill(null);
    const tails: (TNode | null)[] = projectionHeads.slice();

    let componentChild: TNode|null = componentNode.child;

    while (componentChild !== null) {
      const bucketIndex = selectors ?
          matchingProjectionSelectorIndex(componentChild, selectors, textSelectors !) :
          0;

      if (tails[bucketIndex]) {
        tails[bucketIndex] !.projectionNext = componentChild;
      } else {
        projectionHeads[bucketIndex] = componentChild;
      }
      tails[bucketIndex] = componentChild;

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
 * @publicApi
*/
export function Δprojection(nodeIndex: number, selectorIndex: number = 0, attrs?: string[]): void {
  const lView = getLView();
  const tProjectionNode =
      createNodeAtIndex(nodeIndex, TNodeType.Projection, null, null, attrs || null);

  // We can't use viewData[HOST_NODE] because projection nodes can be nested in embedded views.
  if (tProjectionNode.projection === null) tProjectionNode.projection = selectorIndex;

  // `<ng-content>` has no content
  setIsParent(false);

  // re-distribution of projectable nodes is stored on a component's view level
  appendProjectedNodes(lView, tProjectionNode, selectorIndex, findComponentView(lView));
}
