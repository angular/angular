/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DEFER_BLOCK_REGISTRY} from '../defer/registry';
import {DEFER_PARENT_BLOCK_ID} from './interfaces';
import {NGH_DEFER_BLOCKS_KEY} from './utils';
import {Injector} from '../di';
import {TransferState} from '../transfer_state';
import {removeListenersFromBlocks, cleanupContracts} from '../event_delegation_utils';
import {cleanupLContainer} from './cleanup';
import {DeferBlock} from '../defer/interfaces';
import {whenStable, ApplicationRef} from '../application/application_ref';
import {assertEqual} from '../util/assert';

/**
 * Builds a queue of blocks that need to be hydrated, looking up the
 * tree to the topmost defer block that exists in the tree that hasn't
 * been hydrated, but exists in the registry. This queue is in top down
 * heirarchical order as a list of defer block ids.
 * Note: This is utilizing serialized information to navigate up the tree
 */
export function getParentBlockHydrationQueue(deferBlockId: string, injector: Injector) {
  const deferBlockRegistry = injector.get(DEFER_BLOCK_REGISTRY);
  const transferState = injector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});

  let isTopMostDeferBlock = false;
  let currentBlockId: string | null = deferBlockId;
  const deferBlockQueue: string[] = [];

  while (!isTopMostDeferBlock && currentBlockId) {
    ngDevMode &&
      assertEqual(
        deferBlockQueue.indexOf(currentBlockId),
        -1,
        'Internal error: defer block hierarchy has a cycle.',
      );

    deferBlockQueue.unshift(currentBlockId);
    isTopMostDeferBlock = deferBlockRegistry.has(currentBlockId);
    currentBlockId = deferBlockParents[currentBlockId][DEFER_PARENT_BLOCK_ID];
  }
  return deferBlockQueue;
}

/**
 * The core mechanism for incremental hydration. This recursively triggers
 * hydration for all the blocks in the tree that need to be hydrated and keeps
 * track of all those blocks that were hydrated along the way.
 *
 * @param injector
 * @param blockName
 * @param onTriggerFn The function that triggers the block and fetches deps
 * @returns
 */
export async function hydrateFromBlockName(
  injector: Injector,
  blockName: string,
  onTriggerFn: (deferBlock: DeferBlock) => void,
): Promise<{
  deferBlock: DeferBlock | null;
  hydratedBlocks: Set<string>;
}> {
  const deferBlockRegistry = injector.get(DEFER_BLOCK_REGISTRY);

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName))
    return {deferBlock: null, hydratedBlocks: new Set<string>()};

  // Step 1: Get the queue of items that needs to be hydrated
  const hydrationQueue = getParentBlockHydrationQueue(blockName, injector);

  // Step 2: Add all the items in the queue to the registry at once so we don't trigger hydration on them while
  // the sequence of triggers fires.
  hydrationQueue.forEach((id) => deferBlockRegistry.hydrating.add(id));

  // Step 3: hydrate each block in the queue. It will be in descending order from the top down.
  for (const dehydratedBlockId of hydrationQueue) {
    // The registry will have the item in the queue after each loop.
    const deferBlock = deferBlockRegistry.get(dehydratedBlockId)!;

    // Step 4: Run the actual trigger function to fetch dependencies.
    // Triggering a block adds any of its child defer blocks to the registry.
    await onTriggerFn(deferBlock);

    // Step 5: Remove the defer block from the list of hydrating blocks now that it's done hydrating
    deferBlockRegistry.hydrating.delete(dehydratedBlockId);
  }

  const hydratedBlocks = new Set<string>(hydrationQueue);

  // The last item in the queue was the original target block;
  const hydratedBlockId = hydrationQueue.slice(-1)[0];
  const hydratedBlock = deferBlockRegistry.get(hydratedBlockId)!;

  // Step 6: remove all hydrated blocks from the registry
  deferBlockRegistry.removeBlocks(hydratedBlocks);

  if (deferBlockRegistry.size === 0) {
    cleanupContracts(injector);
  }

  return {deferBlock: hydratedBlock, hydratedBlocks};
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
