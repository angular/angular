/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CONTAINER_HEADER_OFFSET, LContainer} from '../render3/interfaces/container';
import {TNode} from '../render3/interfaces/node';
import {isLContainer, isLView} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, LView, TVIEW} from '../render3/interfaces/view';

import {TDeferBlockDetails} from './interfaces';
import {getTDeferBlockDetails, isTDeferBlockDetails} from './utils';

/**
 * Defer block instance for testing.
 */
export interface DeferBlockDetails {
  lContainer: LContainer;
  lView: LView;
  tNode: TNode;
  tDetails: TDeferBlockDetails;
}

/**
 * Retrieves all defer blocks in a given LView.
 *
 * @param lView lView with defer blocks
 * @param deferBlocks defer block aggregator array
 */
export function getDeferBlocks(lView: LView, deferBlocks: DeferBlockDetails[]) {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (isLContainer(lView[i])) {
      const lContainer = lView[i];
      // An LContainer may represent an instance of a defer block, in which case
      // we store it as a result. Otherwise, keep iterating over LContainer views and
      // look for defer blocks.
      const isLast = i === tView.bindingStartIndex - 1;
      if (!isLast) {
        const tNode = tView.data[i] as TNode;
        const tDetails = getTDeferBlockDetails(tView, tNode);
        if (isTDeferBlockDetails(tDetails)) {
          deferBlocks.push({lContainer, lView, tNode, tDetails});
          // This LContainer represents a defer block, so we exit
          // this iteration and don't inspect views in this LContainer.
          continue;
        }
      }
      for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
        getDeferBlocks(lContainer[i] as LView, deferBlocks);
      }
    } else if (isLView(lView[i])) {
      // This is a component, enter the `getDeferBlocks` recursively.
      getDeferBlocks(lView[i], deferBlocks);
    }
  }
}
