/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Trigger, TriggerType} from '../defer/interfaces';
import {hydrateFromBlockName} from './blocks';
import {
  DEFER_HYDRATE_TRIGGERS,
  DEFER_PREFETCH_TRIGGERS,
  NUM_ROOT_NODES,
  SerializedDeferBlock,
} from './interfaces';
import {TRANSFER_STATE_DEFER_BLOCKS_INFO} from './utils';

export function bootstrapAppScopedTriggerContract(container: HTMLElement, appId: string) {
  const deferBlockData = processBlockData(retrieveDeferBlockData(document, appId));
  const commentsByBlockId = gatherDeferBlocksCommentNodes(document, container);
  processTriggers(deferBlockData, commentsByBlockId);
}

function retrieveDeferBlockData(
  doc: Document,
  appId: string,
): {[key: string]: SerializedDeferBlock} {
  // Locate the script tag with the JSON data transferred from the server.
  // The id of the script tag is set to the Angular appId + 'state'.
  const script = doc.getElementById(appId + '-state');
  if (script?.textContent) {
    try {
      // Avoid using any here as it triggers lint errors in google3 (any is not allowed).
      // Decoding of `<` is done of the box by browsers and node.js, same behaviour as G3
      // script_builders.
      const transferStateData = JSON.parse(script.textContent) as {
        [TRANSFER_STATE_DEFER_BLOCKS_INFO]: {[key: string]: SerializedDeferBlock};
      };
      return transferStateData[TRANSFER_STATE_DEFER_BLOCKS_INFO];
    } catch (e) {
      console.warn('Exception while retrieving partial hydration data for ' + appId, e);
    }
  }

  return {};
}

interface BlockSummary {
  data: SerializedDeferBlock;
  hydrate: {idle: boolean; immediate: boolean; viewport: boolean; timer: boolean};
  prefetch: {idle: boolean; immediate: boolean; viewport: boolean; timer: boolean};
}

interface ElementTrigger {
  trigger: TriggerType;
  el: HTMLElement;
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

function processBlockData(blockData: {
  [key: string]: SerializedDeferBlock;
}): Map<string, BlockSummary> {
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

function processTriggers(blockData: Map<string, BlockSummary>, nodes: Map<string, Comment>) {
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
          idleElements.push({trigger: TriggerType.Hydrate, el: currentNode});
        }
        if (blockSummary.hydrate.immediate) {
          immediateElements.push({trigger: TriggerType.Hydrate, el: currentNode});
        }
        if (blockSummary.hydrate.timer) {
          timerElements.push({trigger: TriggerType.Hydrate, el: currentNode});
        }
        if (blockSummary.hydrate.viewport) {
          viewportElements.push({trigger: TriggerType.Hydrate, el: currentNode});
        }
        // prefetch
        // if (blockSummary.prefetch.idle) {
        //   idleElements.push({ trigger: TriggerType.Prefetch, el: currentNode });
        // }
        // if (blockSummary.prefetch.immediate) {
        //   immediateElements.push({ trigger: TriggerType.Prefetch, el: currentNode });
        // }
        // if (blockSummary.prefetch.timer) {
        //   timerElements.push({ trigger: TriggerType.Prefetch, el: currentNode });
        // }
        // if (blockSummary.prefetch.viewport) {
        //   viewportElements.push({ trigger: TriggerType.Prefetch, el: currentNode });
        // }
      }
    }
  }

  setIdleTriggers(idleElements, elementBlockMap);
  setImmediateTriggers(immediateElements, elementBlockMap);
  setViewportTriggers(viewportElements, elementBlockMap);
  setTimerTriggers(timerElements, elementBlockMap);
}

function setIdleTriggers(ets: ElementTrigger[], elementBlockMap: Map<HTMLElement, string>) {
  // set requestidlecallback
}

function setViewportTriggers(ets: ElementTrigger[], elementBlockMap: Map<HTMLElement, string>) {
  const intersectionObserver = new IntersectionObserver((entries) => {
    for (const current of entries) {
      if (current.isIntersecting) {
        const blockName = elementBlockMap.get(current.target as HTMLElement);
        //trigger partial hydration
        // TODO: How will we call in to the app?
        // hydrateFromBlockName(injector, blockName);
      }
    }
  });
  ets.forEach((et) => {
    intersectionObserver.observe(et.el);
  });
}

function setTimerTriggers(ets: ElementTrigger[], elementBlockMap: Map<HTMLElement, string>) {
  // set timer
}

function setImmediateTriggers(ets: ElementTrigger[], elementBlockMap: Map<HTMLElement, string>) {
  // trigger partial hydration
  // hydrateFromBlockName(injector, blockName);
}
