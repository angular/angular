/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {triggerDeferBlock} from '../defer/instructions';
import {LDeferBlockDetails, ON_COMPLETE_FNS} from '../defer/interfaces';
import {DeferBlockRegistry} from '../defer/registry';
import {getLDeferBlockDetails} from '../defer/utils';
import {DEFER_PARENT_BLOCK_ID} from './interfaces';
import {NGH_DEFER_BLOCKS_KEY} from './utils';
import {Injector} from '../di';
import {TransferState} from '../transfer_state';

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

function triggerAndWaitForCompletion(deferBlock: any): Promise<void> {
  const lDetails = getLDeferBlockDetails(deferBlock.lView, deferBlock.tNode);
  const promise = new Promise<void>((resolve) => {
    onDeferBlockCompletion(lDetails, resolve);
  });
  triggerDeferBlock(deferBlock.lView, deferBlock.tNode);
  return promise;
}

async function hydrateFromBlockNameImpl(
  injector: Injector,
  blockName: string,
  hydratedBlocks: Set<string>,
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

    await triggerAndWaitForCompletion(deferBlock);
    for (const dehydratedBlock of dehydratedBlocks) {
      await hydrateFromBlockNameImpl(injector, dehydratedBlock, hydratedBlocks);
    }
  } else {
    // TODO: this is likely an error, consider producing a `console.error`.
  }
}

export async function hydrateFromBlockName(
  injector: Injector,
  blockName: string,
): Promise<Set<string>> {
  const deferBlockRegistry = injector.get(DeferBlockRegistry);
  const hydratedBlocks = new Set<string>();

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return hydratedBlocks;

  await hydrateFromBlockNameImpl(injector, blockName, hydratedBlocks);
  return hydratedBlocks;
}

export function onDeferBlockCompletion(lDetails: LDeferBlockDetails, callback: VoidFunction) {
  if (!Array.isArray(lDetails[ON_COMPLETE_FNS])) {
    lDetails[ON_COMPLETE_FNS] = [];
  }
  lDetails[ON_COMPLETE_FNS].push(callback);
}
