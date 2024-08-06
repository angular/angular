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
): Promise<void> {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return;

  const {blockId, deferBlock, dehydratedBlocks} = findFirstKnownParentDeferBlock(
    blockName,
    injector,
  );
  if (deferBlock && blockId) {
    hydratedBlocks.add(blockId);
    deferBlockRegistry.hydrating.add(blockId);

    await onTriggerFn(deferBlock);
    for (const dehydratedBlock of dehydratedBlocks) {
      await hydrateFromBlockNameImpl(injector, dehydratedBlock, hydratedBlocks, onTriggerFn);
    }
  } else {
    // TODO: this is likely an error, consider producing a `console.error`.
  }
}

export async function hydrateFromBlockName(
  injector: Injector,
  blockName: string,
  onTriggerFn: (deferBlock: any) => void,
): Promise<Set<string>> {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);
  const hydratedBlocks = new Set<string>();

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return hydratedBlocks;

  await hydrateFromBlockNameImpl(injector, blockName, hydratedBlocks, onTriggerFn);
  return hydratedBlocks;
}

export async function partialHydrateFromBlockName(
  injector: Injector,
  blockName: string,
  triggerFn: (deferBlock: any) => void,
): Promise<void> {
  const hydratedBlocks = await hydrateFromBlockName(injector, blockName, triggerFn);
  // TODO(thePunderWoman): restore original bindings here
  removeListenersFromBlocks([...hydratedBlocks], injector);
}
