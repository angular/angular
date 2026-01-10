/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TrackByFunction} from '../../change_detection';
import {CONTAINER_HEADER_OFFSET} from '../interfaces/container';
import {isLContainer, isLView} from '../interfaces/type_checks';
import {HEADER_OFFSET, HOST, LView, TVIEW} from '../interfaces/view';
import {getLContext} from '../context_discovery';
import {collectNativeNodes} from '../collect_native_nodes';
import {LiveCollection} from '../list_reconciliation';

export interface ForLoopBlockData {
  items: unknown[];
  hasEmptyBlock: boolean;
  itemCount: number;
  rootNodes: Node[];
  trackExpression: string;
}

interface RepeaterMetadataShape {
  hasEmptyBlock: boolean;
  trackByFn: TrackByFunction<unknown>;
  liveCollection?: LiveCollection<unknown, unknown>;
  originalTrackByFn?: TrackByFunction<unknown>;
}

/**
 * Checks if a value looks like RepeaterMetadata by duck-typing.
 * Can't use instanceof because that would require importing from control_flow.ts.
 */
function isRepeaterMetadata(value: unknown): value is RepeaterMetadataShape {
  return (
    value !== null &&
    typeof value === 'object' &&
    'hasEmptyBlock' in value &&
    'trackByFn' in value &&
    typeof (value as RepeaterMetadataShape).trackByFn === 'function'
  );
}

function getTrackExpression(metadata: RepeaterMetadataShape): string {
  const trackByFn = metadata.trackByFn;
  if (trackByFn.name === 'ɵɵrepeaterTrackByIndex') {
    return '$index';
  }
  if (trackByFn.name === 'ɵɵrepeaterTrackByIdentity') {
    return '$item';
  }

  const fnForDisplay = metadata.originalTrackByFn ?? trackByFn;
  return fnForDisplay.toString();
}

/**
 * Gets all of the `@for` loop blocks that are present inside the specified DOM node.
 * @param node Node in which to look for `@for` blocks.
 */
export function getForLoopBlocks(node: Node): ForLoopBlockData[] {
  const results: ForLoopBlockData[] = [];
  const lView = getLContext(node)?.lView;

  if (lView) {
    findForLoopBlocks(lView, results);
  }

  return results;
}

/**
 * Finds all the `@for` blocks inside a specific view.
 * @param lView View within which to search for blocks.
 * @param results Array to which to add blocks once they're found.
 */
function findForLoopBlocks(lView: LView, results: ForLoopBlockData[]) {
  const tView = lView[TVIEW];

  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const slotValue = lView[i];

    if (isRepeaterMetadata(slotValue)) {
      const metadata = slotValue;
      const liveCollection = metadata.liveCollection;
      const items: unknown[] = [];

      if (liveCollection) {
        for (let j = 0; j < liveCollection.length; j++) {
          items.push(liveCollection.at(j));
        }
      }

      const containerIndex = i + 1;
      const lContainer = lView[containerIndex];
      const rootNodes: Node[] = [];

      if (isLContainer(lContainer)) {
        // Collect root nodes from each view in the container
        for (let viewIdx = CONTAINER_HEADER_OFFSET; viewIdx < lContainer.length; viewIdx++) {
          const viewAtIdx = lContainer[viewIdx];
          if (isLView(viewAtIdx)) {
            const viewTView = viewAtIdx[TVIEW];
            const viewNodes = collectNativeNodes(viewTView, viewAtIdx, viewTView.firstChild, []);
            rootNodes.push(...viewNodes);
          }
        }
      }

      results.push({
        items,
        hasEmptyBlock: metadata.hasEmptyBlock,
        itemCount: items.length,
        rootNodes,
        trackExpression: getTrackExpression(metadata),
      });
    }

    // Recursively search in LContainers
    if (isLContainer(slotValue)) {
      const lContainer = slotValue;

      if (isLView(lContainer[HOST])) {
        findForLoopBlocks(lContainer[HOST], results);
      }

      for (let j = CONTAINER_HEADER_OFFSET; j < lContainer.length; j++) {
        const viewAtIdx = lContainer[j];
        if (isLView(viewAtIdx)) {
          findForLoopBlocks(viewAtIdx, results);
        }
      }
    } else if (isLView(slotValue)) {
      findForLoopBlocks(slotValue, results);
    }
  }
}
