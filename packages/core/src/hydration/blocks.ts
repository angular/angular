/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DeferBlockRegistry} from '../defer/registry';
import {DEFER_PARENT_BLOCK_ID} from './interfaces';
import {NGH_DEFER_BLOCKS_KEY} from './utils';
import {Injector} from '../di';
import {TransferState} from '../transfer_state';
import {removeListenersFromBlocks} from '../event_delegation_utils';
import {cleanupLContainer} from './cleanup';
import {TNode} from '../render3/interfaces/node';
import {HEADER_OFFSET, LView, TView} from '../render3/interfaces/view';
import {LContainer} from '../render3/interfaces/container';
import {TDeferBlockDetails} from '../defer/interfaces';
import {getDeferBlockDataIndex, getTDeferBlockDetails, isTDeferBlockDetails} from '../defer/utils';
import {whenStable, ApplicationRef} from '../application/application_ref';

/**
 * Finds first hydrated parent `@defer` block for a given block id.
 * If there are any dehydrated `@defer` blocks found along the way,
 * they are also stored and returned from the function (as a list of ids).
 */
export function findFirstKnownParentDeferBlock(deferBlockId: string, injector: Injector) {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);
  const transferState = injector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  const dehydratedBlocks: string[] = [];

  let deferBlock = deferBlockRegistry.get(deferBlockId) ?? null;
  let currentBlockId: string | null = deferBlockId;
  while (!deferBlock) {
    dehydratedBlocks.unshift(currentBlockId);
    currentBlockId = deferBlockParents[currentBlockId][DEFER_PARENT_BLOCK_ID];
    if (!currentBlockId) break;
    deferBlock = deferBlockRegistry.get(currentBlockId);
  }
  return {blockId: currentBlockId, deferBlock, dehydratedBlocks};
}

async function hydrateFromBlockNameImpl(
  injector: Injector,
  blockName: string,
  hydratedBlocks: Set<string>,
  onTriggerFn: (deferBlock: any) => void,
): Promise<{lView: LView; tNode: TNode; lContainer: LContainer} | null> {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return null;

  const {blockId, deferBlock, dehydratedBlocks} = findFirstKnownParentDeferBlock(
    blockName,
    injector,
  );
  if (deferBlock && blockId) {
    hydratedBlocks.add(blockId);
    deferBlockRegistry.hydrating.add(blockId);

    await onTriggerFn(deferBlock);
    let hydratedBlock: {lView: LView; tNode: TNode; lContainer: LContainer} | null = deferBlock;
    for (const dehydratedBlock of dehydratedBlocks) {
      hydratedBlock = await hydrateFromBlockNameImpl(
        injector,
        dehydratedBlock,
        hydratedBlocks,
        onTriggerFn,
      );
    }
    // this is going to be the wrong defer block. We need to get the final one.
    return hydratedBlock;
  } else {
    // TODO: this is likely an error, consider producing a `console.error`.
    return null;
  }
}

export async function hydrateFromBlockName(
  injector: Injector,
  blockName: string,
  onTriggerFn: (deferBlock: any) => void,
): Promise<{
  deferBlock: {lView: LView; tNode: TNode; lContainer: LContainer} | null;
  hydratedBlocks: Set<string>;
}> {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);
  const hydratedBlocks = new Set<string>();

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return {deferBlock: null, hydratedBlocks};

  const deferBlock = await hydrateFromBlockNameImpl(
    injector,
    blockName,
    hydratedBlocks,
    onTriggerFn,
  );
  return {deferBlock, hydratedBlocks};
}

export async function partialHydrateFromBlockName(
  injector: Injector,
  blockName: string,
  triggerFn: (deferBlock: any) => void,
): Promise<void> {
  const {deferBlock, hydratedBlocks} = await hydrateFromBlockName(injector, blockName, triggerFn);
  removeListenersFromBlocks([...hydratedBlocks], injector);
  if (deferBlock !== null) {
    cleanupLContainer(deferBlock.lContainer);
    const appRef = injector.get(ApplicationRef);
    await whenStable(appRef);
  }
}

/**
 * Whether a given TNode represents a defer block.
 */
export function isDeferBlock(tView: TView, tNode: TNode): boolean {
  let tDetails: TDeferBlockDetails | null = null;
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  // Check if a slot index is in the reasonable range.
  // Note: we do `-1` on the right border, since defer block details are stored
  // in the `n+1` slot, see `getDeferBlockDataIndex` for more info.
  if (HEADER_OFFSET < slotIndex && slotIndex < tView.bindingStartIndex) {
    tDetails = getTDeferBlockDetails(tView, tNode);
  }
  return !!tDetails && isTDeferBlockDetails(tDetails);
}
