/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TransferState} from '../transfer_state';
import {onIdle} from '../defer/idle_scheduler';
import {DeferBlockTrigger} from '../defer/interfaces';
import {DEFER_BLOCK_REGISTRY} from '../defer/registry';
import {onTimer} from '../defer/timer_scheduler';
import {Injector} from '../di';
import {assertDefined} from '../util/assert';
import {incrementallyHydrateFromBlockName} from './blocks';
import {
  DEFER_HYDRATE_TRIGGERS,
  NUM_ROOT_NODES,
  SerializedDeferBlock,
  SerializedTriggerDetails,
} from './interfaces';
import {NGH_DEFER_BLOCKS_KEY} from './utils';
import {onViewport} from '../defer/dom_triggers';
import {fetchAndRenderDeferBlock} from './event_replay';

/**
 * Initializes incremental hydration for non-JSAction triggers. This gathers up
 * all the parent / child relationships of defer blocks and identifies all the
 * serialized defer blocks that would need to be potentially hydrated later.
 */
export function bootstrapIncrementalHydration(doc: Document, injector: Injector) {
  const deferBlockData = processBlockData(injector);
  const commentsByBlockId = gatherDeferBlocksCommentNodes(doc, doc.body);
  processAndInitTriggers(injector, deferBlockData, commentsByBlockId);
}

/**
 * Summarizes the presence of specific types of triggers anywhere in the DOM
 */
interface BlockSummary {
  data: SerializedDeferBlock;
  hydrate: {idle: boolean; immediate: boolean; viewport: boolean; timer: number | null};
}

/**
 * The details of a specific element's trigger and how it is associated to a block
 */
interface ElementTrigger {
  el: HTMLElement;
  blockName: string;
  delay?: number;
}

function isTimerTrigger(triggerInfo: DeferBlockTrigger | SerializedTriggerDetails): boolean {
  return typeof triggerInfo === 'object' && triggerInfo.trigger === DeferBlockTrigger.Timer;
}

function getHydrateTimerTrigger(blockData: SerializedDeferBlock): number | null {
  const trigger = blockData[DEFER_HYDRATE_TRIGGERS]?.find((t) => isTimerTrigger(t));
  return (trigger as SerializedTriggerDetails)?.delay ?? null;
}

function hasHydrateTrigger(blockData: SerializedDeferBlock, trigger: DeferBlockTrigger): boolean {
  return blockData[DEFER_HYDRATE_TRIGGERS]?.includes(trigger) ?? false;
}

/**
 * Creates a summary of the given serialized defer block, which is used later to properly initialize
 * specific triggers.
 */
function createBlockSummary(blockInfo: SerializedDeferBlock): BlockSummary {
  return {
    data: blockInfo,
    hydrate: {
      idle: hasHydrateTrigger(blockInfo, DeferBlockTrigger.Idle),
      immediate: hasHydrateTrigger(blockInfo, DeferBlockTrigger.Immediate),
      timer: getHydrateTimerTrigger(blockInfo),
      viewport: hasHydrateTrigger(blockInfo, DeferBlockTrigger.Viewport),
    },
  };
}

/**
 * Processes all of the defer block data in the transfer state and creates a map of the summaries
 */
function processBlockData(injector: Injector): Map<string, BlockSummary> {
  const blockData = retrieveDeferBlockData(injector);
  let blockDetails = new Map<string, BlockSummary>();
  for (let blockId in blockData) {
    blockDetails.set(blockId, createBlockSummary(blockData[blockId]));
  }
  return blockDetails;
}

/**
 * Retrieves all comments nodes that contain ngh comments referring to a defer block
 */
function gatherDeferBlocksCommentNodes(doc: Document, node: HTMLElement): Map<string, Comment> {
  const commentNodesIterator = doc.createNodeIterator(node, NodeFilter.SHOW_COMMENT, {acceptNode});
  let currentNode: Comment;

  const nodesByBlockId = new Map<string, Comment>();
  while ((currentNode = commentNodesIterator.nextNode() as Comment)) {
    // TODO(incremental-hydration: convert this to use string parsing rather than regex
    const regex = new RegExp(/^\s*ngh=(d[0-9]+)/g);
    const result = regex.exec(currentNode?.textContent ?? '');
    if (result && result?.length > 0) {
      nodesByBlockId.set(result[1], currentNode);
    }
  }
  return nodesByBlockId;
}

function acceptNode(node: HTMLElement) {
  return node.textContent?.trimStart().startsWith('ngh=')
    ? NodeFilter.FILTER_ACCEPT
    : NodeFilter.FILTER_REJECT;
}

/**
 * Loops through all defer block summaries and ensures all the blocks triggers are
 * properly initialized
 */
function processAndInitTriggers(
  injector: Injector,
  blockData: Map<string, BlockSummary>,
  nodes: Map<string, Comment>,
) {
  const idleElements: ElementTrigger[] = [];
  const timerElements: ElementTrigger[] = [];
  const viewportElements: ElementTrigger[] = [];
  const immediateElements: ElementTrigger[] = [];
  for (let [blockId, blockSummary] of blockData) {
    const commentNode = nodes.get(blockId);
    if (commentNode !== undefined) {
      const numRootNodes = blockSummary.data[NUM_ROOT_NODES];
      let currentNode: Comment | HTMLElement = commentNode;
      for (let i = 0; i < numRootNodes; i++) {
        currentNode = currentNode.previousSibling as HTMLElement;
        if (currentNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
        const elementTrigger: ElementTrigger = {el: currentNode, blockName: blockId};
        // hydrate
        if (blockSummary.hydrate.idle) {
          idleElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.immediate) {
          immediateElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.timer !== null) {
          elementTrigger.delay = blockSummary.hydrate.timer;
          timerElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.viewport) {
          viewportElements.push(elementTrigger);
        }
      }
    }
  }

  setIdleTriggers(injector, idleElements);
  setImmediateTriggers(injector, immediateElements);
  setViewportTriggers(injector, viewportElements);
  setTimerTriggers(injector, timerElements);
}

async function setIdleTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (const elementTrigger of elementTriggers) {
    const registry = injector.get(DEFER_BLOCK_REGISTRY);
    const onInvoke = () =>
      incrementallyHydrateFromBlockName(
        injector,
        elementTrigger.blockName,
        fetchAndRenderDeferBlock,
      );
    const cleanupFn = onIdle(onInvoke, injector);
    registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
  }
}

async function setViewportTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (let elementTrigger of elementTriggers) {
    onViewport(
      elementTrigger.el,
      async () => {
        await incrementallyHydrateFromBlockName(
          injector,
          elementTrigger.blockName,
          fetchAndRenderDeferBlock,
        );
      },
      injector,
    );
  }
}

async function setTimerTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (const elementTrigger of elementTriggers) {
    const registry = injector.get(DEFER_BLOCK_REGISTRY);
    const onInvoke = async () =>
      await incrementallyHydrateFromBlockName(
        injector,
        elementTrigger.blockName,
        fetchAndRenderDeferBlock,
      );
    const timerFn = onTimer(elementTrigger.delay!);
    const cleanupFn = timerFn(onInvoke, injector);
    registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
  }
}

async function setImmediateTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (const elementTrigger of elementTriggers) {
    await incrementallyHydrateFromBlockName(
      injector,
      elementTrigger.blockName,
      fetchAndRenderDeferBlock,
    );
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
