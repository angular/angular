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
import {HEADER_OFFSET, TView} from '../render3/interfaces/view';
import {DeferBlock, TDeferBlockDetails} from '../defer/interfaces';
import {getDeferBlockDataIndex, getTDeferBlockDetails, isTDeferBlockDetails} from '../defer/utils';
import {whenStable, ApplicationRef} from '../application/application_ref';

/**
 * Finds first hydrated parent `@defer` block for a given block id.
 * If there are any dehydrated `@defer` blocks found along the way,
 * they are also stored and returned from the function (as a list of ids).
 */
export function findFirstHydratedParentDeferBlock(deferBlockId: string, injector: Injector) {
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

/**
 * Hydrates a defer block by block name through jsaction code paths
 */
let _hydrateFromBlockNameImpl: typeof hydrateFromBlockNameImpl = () => {
  return Promise.resolve({deferBlock: null, hydratedBlocks: new Set<string>()});
};

/**
 * Hydrates a defer block by block name using non jsaction code paths
 */
let _incrementallyHydrateFromBlockNameImpl: typeof incrementallyHydrateFromBlockNameImpl = () => {
  return Promise.resolve();
};

async function hydrateFromBlockNameImpl(
  injector: Injector,
  blockName: string,
  onTriggerFn: (deferBlock: any) => void,
  hydratedBlocks: Set<string>,
): Promise<{
  deferBlock: DeferBlock | null;
  hydratedBlocks: Set<string>;
}> {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return {deferBlock: null, hydratedBlocks};

  const {blockId, deferBlock, dehydratedBlocks} = findFirstHydratedParentDeferBlock(
    blockName,
    injector,
  );
  if (deferBlock && blockId) {
    hydratedBlocks.add(blockId);
    deferBlockRegistry.hydrating.add(blockId);

    await onTriggerFn(deferBlock);
    let hydratedBlock: DeferBlock | null = deferBlock;
    for (const dehydratedBlock of dehydratedBlocks) {
      const hydratedInfo = await hydrateFromBlockNameImpl(
        injector,
        dehydratedBlock,
        onTriggerFn,
        hydratedBlocks,
      );
      hydratedBlock = hydratedInfo.deferBlock;
    }
    // this is going to be the wrong defer block. We need to get the final one.
    return {deferBlock: hydratedBlock, hydratedBlocks};
  } else {
    // TODO(incremental-hydration): this is likely an error, consider producing a `console.error`.
    return {deferBlock: null, hydratedBlocks};
  }
}

/**
 * Sets the implementation for the `retrieveDeferBlockData` function.
 */
export function enableHydrateFromBlockNameImpl() {
  _hydrateFromBlockNameImpl = hydrateFromBlockNameImpl;
  _incrementallyHydrateFromBlockNameImpl = incrementallyHydrateFromBlockNameImpl;
}

export async function hydrateFromBlockName(
  injector: Injector,
  blockName: string,
  onTriggerFn: (deferBlock: any) => void,
): Promise<{
  deferBlock: DeferBlock | null;
  hydratedBlocks: Set<string>;
}> {
  return await _hydrateFromBlockNameImpl(injector, blockName, onTriggerFn, new Set<string>());
}

async function incrementallyHydrateFromBlockNameImpl(
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

export function incrementallyHydrateFromBlockName(
  injector: Injector,
  blockName: string,
  triggerFn: (deferBlock: any) => void,
): Promise<void> {
  return _incrementallyHydrateFromBlockNameImpl(injector, blockName, triggerFn);
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
