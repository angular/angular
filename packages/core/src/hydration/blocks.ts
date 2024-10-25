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
import {DeferBlock} from '../defer/interfaces';
import {whenStable, ApplicationRef} from '../application/application_ref';

/**
 * Finds first hydrated parent `@defer` block for a given block id.
 * If there are any dehydrated `@defer` blocks found along the way,
 * they are also stored and returned from the function (as a list of ids).
 * Note: This is utilizing serialized information to navigate up the tree
 */
export function findFirstHydratedParentDeferBlock(deferBlockId: string, injector: Injector) {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);
  const transferState = injector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  const dehydratedBlocks: string[] = [];

  let deferBlock = deferBlockRegistry.get(deferBlockId);
  let currentBlockId: string | null = deferBlockId;
  // at each level we check if the registry has the given defer block id
  // - if it does, we know it was already hydrated and can stop here
  // - if it does not, we continue on
  while (!deferBlock) {
    dehydratedBlocks.unshift(currentBlockId);
    currentBlockId = deferBlockParents[currentBlockId][DEFER_PARENT_BLOCK_ID];
    if (!currentBlockId) break;
    deferBlock = deferBlockRegistry.get(currentBlockId);
  }
  return {blockId: currentBlockId, deferBlock, dehydratedBlocks};
}

/**
 * The core mechanism for incremental hydration. This recursively triggers
 * hydration for all the blocks in the tree that need to be hydrated and keeps
 * track of all those blocks that were hydrated along the way.
 *
 * @param injector
 * @param blockName
 * @param onTriggerFn The function that triggers the block and fetches deps
 * @param hydratedBlocks The set of blocks currently being hydrated in the tree
 * @returns
 */
export async function hydrateFromBlockName(
  injector: Injector,
  blockName: string,
  onTriggerFn: (deferBlock: DeferBlock) => void,
  hydratedBlocks: Set<string> = new Set(),
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
    // Step 2: Add the current block to the tracking sets to prevent
    // attempting to trigger hydration on a block more than once
    // simulataneously.
    hydratedBlocks.add(blockId);
    deferBlockRegistry.hydrating.add(blockId);

    // Step 3: Run the actual trigger function to fetch dependencies
    await onTriggerFn(deferBlock);

    // Step 4: Recursively trigger, fetch, and hydrate from the top of the hierarchy down
    let hydratedBlock: DeferBlock | null = deferBlock;
    for (const dehydratedBlock of dehydratedBlocks) {
      const hydratedInfo = await hydrateFromBlockName(
        injector,
        dehydratedBlock,
        onTriggerFn,
        hydratedBlocks,
      );
      hydratedBlock = hydratedInfo.deferBlock;
    }
    // TODO(incremental-hydration): this is likely where we want to do Step 5: some cleanup work in the
    // DeferBlockRegistry.
    return {deferBlock: hydratedBlock, hydratedBlocks};
  } else {
    // TODO(incremental-hydration): this is likely an error, consider producing a `console.error`.
    return {deferBlock: null, hydratedBlocks};
  }
}

export async function incrementallyHydrateFromBlockName(
  injector: Injector,
  blockName: string,
  triggerFn: (deferBlock: DeferBlock) => void,
): Promise<void> {
  const {deferBlock, hydratedBlocks} = await hydrateFromBlockName(injector, blockName, triggerFn);
  if (deferBlock !== null) {
    // hydratedBlocks is a set, and needs to be converted to an array
    // for removing listeners
    removeListenersFromBlocks([...hydratedBlocks], injector);
    cleanupLContainer(deferBlock.lContainer);
    // we need to wait for app stability here so we don't continue before
    // the hydration process has finished, which could result in problems
    await whenStable(injector.get(ApplicationRef));
  }
  return Promise.resolve();
}
