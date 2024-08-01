/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TransferState} from '../core';
import {Trigger} from '../defer/interfaces';
import {Injector} from '../di';
import {assertDefined} from '../util/assert';
import {partialHydrateFromBlockName} from './blocks';
import {
  DEFER_HYDRATE_TRIGGERS,
  DEFER_PREFETCH_TRIGGERS,
  NUM_ROOT_NODES,
  SerializedDeferBlock,
} from './interfaces';
import {NGH_DEFER_BLOCKS_KEY} from './utils';

export function bootstrapPartialHydration(doc: Document, injector: Injector) {
  const deferBlockData = processBlockData(injector);
  const commentsByBlockId = gatherDeferBlocksCommentNodes(doc, doc.body);
  processAndInitTriggers(injector, deferBlockData, commentsByBlockId);
}

interface BlockSummary {
  data: SerializedDeferBlock;
  hydrate: {idle: boolean; immediate: boolean; viewport: boolean; timer: boolean};
  prefetch: {idle: boolean; immediate: boolean; viewport: boolean; timer: boolean};
}

interface ElementTrigger {
  trigger: number;
  el: HTMLElement;
  blockName: string;
}

function hasHydrateTrigger(blockData: SerializedDeferBlock, trigger: Trigger): boolean {
  return blockData[DEFER_HYDRATE_TRIGGERS]?.includes(trigger) ?? false;
}

function hasPrefetchTrigger(blockData: SerializedDeferBlock, trigger: Trigger): boolean {
  return blockData[DEFER_PREFETCH_TRIGGERS]?.includes(trigger) ?? false;
}

function createBlockSummary(blockInfo: SerializedDeferBlock): BlockSummary {
  return {
    data: blockInfo,
    hydrate: {
      idle: hasHydrateTrigger(blockInfo, Trigger.Idle),
      immediate: hasHydrateTrigger(blockInfo, Trigger.Immediate),
      timer: hasHydrateTrigger(blockInfo, Trigger.Timer),
      viewport: hasHydrateTrigger(blockInfo, Trigger.Viewport),
    },
    prefetch: {
      idle: hasPrefetchTrigger(blockInfo, Trigger.Idle),
      immediate: hasPrefetchTrigger(blockInfo, Trigger.Immediate),
      timer: hasPrefetchTrigger(blockInfo, Trigger.Timer),
      viewport: hasPrefetchTrigger(blockInfo, Trigger.Viewport),
    },
  };
}

function processBlockData(injector: Injector): Map<string, BlockSummary> {
  const blockData = retrieveDeferBlockData(injector);
  let blockDetails = new Map<string, BlockSummary>();
  for (let blockId in blockData) {
    blockDetails.set(blockId, createBlockSummary(blockData[blockId]));
  }
  return blockDetails;
}

function gatherDeferBlocksCommentNodes(doc: Document, node?: HTMLElement): Map<string, Comment> {
  const commentNodesIterator = doc.createNodeIterator(node ?? doc.body, NodeFilter.SHOW_COMMENT, {
    acceptNode(node) {
      return node.textContent?.match('ngh=') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let currentNode: Comment;

  const nodesByBlockId = new Map<string, Comment>();
  while ((currentNode = commentNodesIterator.nextNode() as Comment)) {
    const result = currentNode?.textContent?.match('d[0-9]+');
    if (result?.length === 1) {
      nodesByBlockId.set(result[0], currentNode);
    }
  }
  return nodesByBlockId;
}

function processAndInitTriggers(
  injector: Injector,
  blockData: Map<string, BlockSummary>,
  nodes: Map<string, Comment>,
) {
  const idleElements: ElementTrigger[] = [];
  const timerElements: ElementTrigger[] = [];
  const viewportElements: ElementTrigger[] = [];
  const immediateElements: ElementTrigger[] = [];
  const elementBlockMap = new Map<HTMLElement, string>();
  for (let [blockId, blockSummary] of blockData) {
    const commentNode = nodes.get(blockId);
    if (commentNode !== undefined) {
      const numRootNodes = blockSummary.data[NUM_ROOT_NODES];
      let currentNode: Comment | HTMLElement = commentNode;
      for (let i = 0; i < numRootNodes; i++) {
        currentNode = currentNode.previousSibling as HTMLElement;
        elementBlockMap.set(currentNode, blockId);
        // hydrate
        if (blockSummary.hydrate.idle) {
          idleElements.push({trigger: 2, el: currentNode, blockName: blockId});
        }
        if (blockSummary.hydrate.immediate) {
          immediateElements.push({trigger: 2, el: currentNode, blockName: blockId});
        }
        if (blockSummary.hydrate.timer) {
          timerElements.push({trigger: 2, el: currentNode, blockName: blockId});
        }
        if (blockSummary.hydrate.viewport) {
          viewportElements.push({trigger: 2, el: currentNode, blockName: blockId});
        }
        // prefetch
        // if (blockSummary.prefetch.idle) {
        //   idleElements.push({ trigger: 1, el: currentNode });
        // }
        // if (blockSummary.prefetch.immediate) {
        //   immediateElements.push({ trigger: 1, el: currentNode });
        // }
        // if (blockSummary.prefetch.timer) {
        //   timerElements.push({ trigger: 1, el: currentNode });
        // }
        // if (blockSummary.prefetch.viewport) {
        //   viewportElements.push({ trigger: 1, el: currentNode });
        // }
      }
    }
  }

  setIdleTriggers(injector, idleElements);
  setImmediateTriggers(injector, immediateElements);
  setViewportTriggers(injector, viewportElements, elementBlockMap);
  setTimerTriggers(injector, timerElements);
}

async function setIdleTriggers(injector: Injector, ets: ElementTrigger[]) {
  // set requestidlecallback
}

async function setViewportTriggers(
  injector: Injector,
  ets: ElementTrigger[],
  elementBlockMap: Map<HTMLElement, string>,
) {
  if (ets.length > 0) {
    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const current of entries) {
        if (current.isIntersecting) {
          partialHydrateFromBlockName(
            injector,
            elementBlockMap.get(current.target as HTMLElement)!,
          );
        }
      }
    });
    ets.forEach((et) => {
      intersectionObserver.observe(et.el);
    });
  }
}

async function setTimerTriggers(injector: Injector, ets: ElementTrigger[]) {
  // set timer
}

async function setImmediateTriggers(injector: Injector, ets: ElementTrigger[]) {
  for (const elementTrigger of ets) {
    partialHydrateFromBlockName(injector, elementTrigger.blockName);
  }
}

/**
 * Retrieves defer block hydration information from the TransferState.
 *
 * @param injector Injector that this component has access to.
 */
let _retrieveDeferBlockDataImpl: typeof retrieveDeferBlockDataImpl = () => {
  return {};
};

export function retrieveDeferBlockDataImpl(injector: Injector): {
  [key: string]: SerializedDeferBlock;
} {
  const transferState = injector.get(TransferState, null, {optional: true});
  if (transferState !== null) {
    const nghDeferData = transferState.get(NGH_DEFER_BLOCKS_KEY, {});

    // If the `ngh` attribute exists and has a non-empty value,
    // the hydration info *must* be present in the TransferState.
    // If there is no data for some reasons, this is an error.
    ngDevMode &&
      assertDefined(nghDeferData, 'Unable to retrieve defer block info from the TransferState.');
    return nghDeferData;
  }

  return {};
}

/**
 * Sets the implementation for the `retrieveDeferBlockData` function.
 */
export function enableRetrieveDeferBlockDataImpl() {
  _retrieveDeferBlockDataImpl = retrieveDeferBlockDataImpl;
}

/**
 * Retrieves defer block data from TransferState storage
 */
export function retrieveDeferBlockData(injector: Injector): {[key: string]: SerializedDeferBlock} {
  return _retrieveDeferBlockDataImpl(injector);
}
