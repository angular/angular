/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di/injector';
import type {ViewRef} from '../linker/view_ref';
import {getComponent} from '../render3/util/discovery_utils';
import {LContainer} from '../render3/interfaces/container';
import {getDocument} from '../render3/interfaces/document';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {isRootView} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, TVIEW, TViewType} from '../render3/interfaces/view';
import {makeStateKey, StateKey, TransferState} from '../transfer_state';
import {assertDefined, assertEqual} from '../util/assert';
import type {HydrationContext} from './annotate';

import {
  BlockSummary,
  CONTAINERS,
  DEFER_HYDRATE_TRIGGERS,
  DEFER_PARENT_BLOCK_ID,
  DehydratedView,
  DISCONNECTED_NODES,
  ELEMENT_CONTAINERS,
  MULTIPLIER,
  NUM_ROOT_NODES,
  SerializedContainerView,
  SerializedDeferBlock,
  SerializedTriggerDetails,
  SerializedView,
} from './interfaces';
import {IS_INCREMENTAL_HYDRATION_ENABLED, JSACTION_BLOCK_ELEMENT_MAP} from './tokens';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {DeferBlockTrigger, HydrateTriggerDetails} from '../defer/interfaces';
import {hoverEventNames, interactionEventNames} from '../defer/dom_triggers';
import {DEHYDRATED_BLOCK_REGISTRY} from '../defer/registry';
import {sharedMapFunction} from '../event_delegation_utils';
import {isDetachedByI18n} from '../i18n/utils';
import {isInSkipHydrationBlock} from '../render3/state';
import {TNode} from '../render3/interfaces/node';

/**
 * The name of the key used in the TransferState collection,
 * where hydration information is located.
 */
const TRANSFER_STATE_TOKEN_ID = '__nghData__';

/**
 * Lookup key used to reference DOM hydration data (ngh) in `TransferState`.
 */
export const NGH_DATA_KEY: StateKey<SerializedView[]> =
  makeStateKey<Array<SerializedView>>(TRANSFER_STATE_TOKEN_ID);

/**
 * The name of the key used in the TransferState collection,
 * where serialized defer block information is located.
 */
export const TRANSFER_STATE_DEFER_BLOCKS_INFO = '__nghDeferData__';

/**
 * Lookup key used to retrieve defer block datain `TransferState`.
 */
export const NGH_DEFER_BLOCKS_KEY: StateKey<{[key: string]: SerializedDeferBlock}> = makeStateKey<{
  [key: string]: SerializedDeferBlock;
}>(TRANSFER_STATE_DEFER_BLOCKS_INFO);

/**
 * The name of the attribute that would be added to host component
 * nodes and contain a reference to a particular slot in transferred
 * state that contains the necessary hydration info for this component.
 */
export const NGH_ATTR_NAME = 'ngh';

/**
 * Marker used in a comment node to ensure hydration content integrity
 */
export const SSR_CONTENT_INTEGRITY_MARKER = 'nghm';

export const enum TextNodeMarker {
  /**
   * The contents of the text comment added to nodes that would otherwise be
   * empty when serialized by the server and passed to the client. The empty
   * node is lost when the browser parses it otherwise. This comment node will
   * be replaced during hydration in the client to restore the lost empty text
   * node.
   */
  EmptyNode = 'ngetn',

  /**
   * The contents of the text comment added in the case of adjacent text nodes.
   * When adjacent text nodes are serialized by the server and sent to the
   * client, the browser loses reference to the amount of nodes and assumes
   * just one text node. This separator is replaced during hydration to restore
   * the proper separation and amount of text nodes that should be present.
   */
  Separator = 'ngtns',
}

/**
 * Reference to a function that reads `ngh` attribute value from a given RNode
 * and retrieves hydration information from the TransferState using that value
 * as an index. Returns `null` by default, when hydration is not enabled.
 *
 * @param rNode Component's host element.
 * @param injector Injector that this component has access to.
 * @param isRootView Specifies whether we trying to read hydration info for the root view.
 */
let _retrieveHydrationInfoImpl: typeof retrieveHydrationInfoImpl = () => null;

export function retrieveHydrationInfoImpl(
  rNode: RElement,
  injector: Injector,
  isRootView = false,
): DehydratedView | null {
  let nghAttrValue = rNode.getAttribute(NGH_ATTR_NAME);
  if (nghAttrValue == null) return null;

  // For cases when a root component also acts as an anchor node for a ViewContainerRef
  // (for example, when ViewContainerRef is injected in a root component), there is a need
  // to serialize information about the component itself, as well as an LContainer that
  // represents this ViewContainerRef. Effectively, we need to serialize 2 pieces of info:
  // (1) hydration info for the root component itself and (2) hydration info for the
  // ViewContainerRef instance (an LContainer). Each piece of information is included into
  // the hydration data (in the TransferState object) separately, thus we end up with 2 ids.
  // Since we only have 1 root element, we encode both bits of info into a single string:
  // ids are separated by the `|` char (e.g. `10|25`, where `10` is the ngh for a component view
  // and 25 is the `ngh` for a root view which holds LContainer).
  const [componentViewNgh, rootViewNgh] = nghAttrValue.split('|');
  nghAttrValue = isRootView ? rootViewNgh : componentViewNgh;
  if (!nghAttrValue) return null;

  // We've read one of the ngh ids, keep the remaining one, so that
  // we can set it back on the DOM element.
  const rootNgh = rootViewNgh ? `|${rootViewNgh}` : '';
  const remainingNgh = isRootView ? componentViewNgh : rootNgh;

  let data: SerializedView = {};
  // An element might have an empty `ngh` attribute value (e.g. `<comp ngh="" />`),
  // which means that no special annotations are required. Do not attempt to read
  // from the TransferState in this case.
  if (nghAttrValue !== '') {
    const transferState = injector.get(TransferState, null, {optional: true});
    if (transferState !== null) {
      const nghData = transferState.get(NGH_DATA_KEY, []);

      // The nghAttrValue is always a number referencing an index
      // in the hydration TransferState data.
      data = nghData[Number(nghAttrValue)];

      // If the `ngh` attribute exists and has a non-empty value,
      // the hydration info *must* be present in the TransferState.
      // If there is no data for some reasons, this is an error.
      ngDevMode && assertDefined(data, 'Unable to retrieve hydration info from the TransferState.');
    }
  }
  const dehydratedView: DehydratedView = {
    data,
    firstChild: rNode.firstChild ?? null,
  };

  if (isRootView) {
    // If there is hydration info present for the root view, it means that there was
    // a ViewContainerRef injected in the root component. The root component host element
    // acted as an anchor node in this scenario. As a result, the DOM nodes that represent
    // embedded views in this ViewContainerRef are located as siblings to the host node,
    // i.e. `<app-root /><#VIEW1><#VIEW2>...<!--container-->`. In this case, the current
    // node becomes the first child of this root view and the next sibling is the first
    // element in the DOM segment.
    dehydratedView.firstChild = rNode;

    // We use `0` here, since this is the slot (right after the HEADER_OFFSET)
    // where a component LView or an LContainer is located in a root LView.
    setSegmentHead(dehydratedView, 0, rNode.nextSibling);
  }

  if (remainingNgh) {
    // If we have only used one of the ngh ids, store the remaining one
    // back on this RNode.
    rNode.setAttribute(NGH_ATTR_NAME, remainingNgh);
  } else {
    // The `ngh` attribute is cleared from the DOM node now
    // that the data has been retrieved for all indices.
    rNode.removeAttribute(NGH_ATTR_NAME);
  }

  // Note: don't check whether this node was claimed for hydration,
  // because this node might've been previously claimed while processing
  // template instructions.
  ngDevMode && markRNodeAsClaimedByHydration(rNode, /* checkIfAlreadyClaimed */ false);
  ngDevMode && ngDevMode.hydratedComponents++;

  return dehydratedView;
}

/**
 * Sets the implementation for the `retrieveHydrationInfo` function.
 */
export function enableRetrieveHydrationInfoImpl() {
  _retrieveHydrationInfoImpl = retrieveHydrationInfoImpl;
}

/**
 * Retrieves hydration info by reading the value from the `ngh` attribute
 * and accessing a corresponding slot in TransferState storage.
 */
export function retrieveHydrationInfo(
  rNode: RElement,
  injector: Injector,
  isRootView = false,
): DehydratedView | null {
  return _retrieveHydrationInfoImpl(rNode, injector, isRootView);
}

/**
 * Retrieves the necessary object from a given ViewRef to serialize:
 *  - an LView for component views
 *  - an LContainer for cases when component acts as a ViewContainerRef anchor
 *  - `null` in case of an embedded view
 */
export function getLNodeForHydration(viewRef: ViewRef): LView | LContainer | null {
  // Reading an internal field from `ViewRef` instance.
  let lView = (viewRef as any)._lView as LView;
  const tView = lView[TVIEW];
  // A registered ViewRef might represent an instance of an
  // embedded view, in which case we do not need to annotate it.
  if (tView.type === TViewType.Embedded) {
    return null;
  }
  // Check if it's a root view and if so, retrieve component's
  // LView from the first slot after the header.
  if (isRootView(lView)) {
    lView = lView[HEADER_OFFSET];
  }

  return lView;
}

function getTextNodeContent(node: Node): string | undefined {
  return node.textContent?.replace(/\s/gm, '');
}

/**
 * Restores text nodes and separators into the DOM that were lost during SSR
 * serialization. The hydration process replaces empty text nodes and text
 * nodes that are immediately adjacent to other text nodes with comment nodes
 * that this method filters on to restore those missing nodes that the
 * hydration process is expecting to be present.
 *
 * @param node The app's root HTML Element
 */
export function processTextNodeMarkersBeforeHydration(node: HTMLElement) {
  const doc = getDocument();
  const commentNodesIterator = doc.createNodeIterator(node, NodeFilter.SHOW_COMMENT, {
    acceptNode(node) {
      const content = getTextNodeContent(node);
      const isTextNodeMarker =
        content === TextNodeMarker.EmptyNode || content === TextNodeMarker.Separator;
      return isTextNodeMarker ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let currentNode: Comment;
  // We cannot modify the DOM while using the commentIterator,
  // because it throws off the iterator state.
  // So we collect all marker nodes first and then follow up with
  // applying the changes to the DOM: either inserting an empty node
  // or just removing the marker if it was used as a separator.
  const nodes = [];
  while ((currentNode = commentNodesIterator.nextNode() as Comment)) {
    nodes.push(currentNode);
  }
  for (const node of nodes) {
    if (node.textContent === TextNodeMarker.EmptyNode) {
      node.replaceWith(doc.createTextNode(''));
    } else {
      node.remove();
    }
  }
}

/**
 * Internal type that represents a claimed node.
 * Only used in dev mode.
 */
export enum HydrationStatus {
  Hydrated = 'hydrated',
  Skipped = 'skipped',
  Mismatched = 'mismatched',
}

export type HydrationInfo =
  | {
      status: HydrationStatus.Hydrated | HydrationStatus.Skipped;
    }
  | {
      status: HydrationStatus.Mismatched;
      actualNodeDetails: string | null;
      expectedNodeDetails: string | null;
    };

const HYDRATION_INFO_KEY = '__ngDebugHydrationInfo__';

export type HydratedNode = {
  [HYDRATION_INFO_KEY]?: HydrationInfo;
} & Element;

function patchHydrationInfo(node: RNode, info: HydrationInfo) {
  (node as HydratedNode)[HYDRATION_INFO_KEY] = info;
}

export function readHydrationInfo(node: RNode): HydrationInfo | null {
  return (node as HydratedNode)[HYDRATION_INFO_KEY] ?? null;
}

/**
 * Marks a node as "claimed" by hydration process.
 * This is needed to make assessments in tests whether
 * the hydration process handled all nodes.
 */
export function markRNodeAsClaimedByHydration(node: RNode, checkIfAlreadyClaimed = true) {
  if (!ngDevMode) {
    throw new Error(
      'Calling `markRNodeAsClaimedByHydration` in prod mode ' +
        'is not supported and likely a mistake.',
    );
  }
  if (checkIfAlreadyClaimed && isRNodeClaimedForHydration(node)) {
    throw new Error('Trying to claim a node, which was claimed already.');
  }
  patchHydrationInfo(node, {status: HydrationStatus.Hydrated});
  ngDevMode.hydratedNodes++;
}

export function markRNodeAsSkippedByHydration(node: RNode) {
  if (!ngDevMode) {
    throw new Error(
      'Calling `markRNodeAsSkippedByHydration` in prod mode ' +
        'is not supported and likely a mistake.',
    );
  }
  patchHydrationInfo(node, {status: HydrationStatus.Skipped});
  ngDevMode.componentsSkippedHydration++;
}

export function countBlocksSkippedByHydration(injector: Injector) {
  const transferState = injector.get(TransferState);
  const nghDeferData = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  if (ngDevMode) {
    ngDevMode.deferBlocksWithIncrementalHydration = Object.keys(nghDeferData).length;
  }
}

export function markRNodeAsHavingHydrationMismatch(
  node: RNode,
  expectedNodeDetails: string | null = null,
  actualNodeDetails: string | null = null,
) {
  if (!ngDevMode) {
    throw new Error(
      'Calling `markRNodeAsMismatchedByHydration` in prod mode ' +
        'is not supported and likely a mistake.',
    );
  }

  // The RNode can be a standard HTMLElement (not an Angular component or directive)
  // The devtools component tree only displays Angular components & directives
  // Therefore we attach the debug info to the closest component/directive
  while (node && !getComponent(node as Element)) {
    node = node?.parentNode as RNode;
  }

  if (node) {
    patchHydrationInfo(node, {
      status: HydrationStatus.Mismatched,
      expectedNodeDetails,
      actualNodeDetails,
    });
  }
}

export function isRNodeClaimedForHydration(node: RNode): boolean {
  return readHydrationInfo(node)?.status === HydrationStatus.Hydrated;
}

export function setSegmentHead(
  hydrationInfo: DehydratedView,
  index: number,
  node: RNode | null,
): void {
  hydrationInfo.segmentHeads ??= {};
  hydrationInfo.segmentHeads[index] = node;
}

export function getSegmentHead(hydrationInfo: DehydratedView, index: number): RNode | null {
  return hydrationInfo.segmentHeads?.[index] ?? null;
}

export function isIncrementalHydrationEnabled(injector: Injector): boolean {
  return injector.get(IS_INCREMENTAL_HYDRATION_ENABLED, false, {
    optional: true,
  });
}

/** Throws an error if the incremental hydration is not enabled */
export function assertIncrementalHydrationIsConfigured(injector: Injector) {
  if (!isIncrementalHydrationEnabled(injector)) {
    throw new RuntimeError(
      RuntimeErrorCode.MISCONFIGURED_INCREMENTAL_HYDRATION,
      'Angular has detected that some `@defer` blocks use `hydrate` triggers, ' +
        'but incremental hydration was not enabled. Please ensure that the `withIncrementalHydration()` ' +
        'call is added as an argument for the `provideClientHydration()` function call ' +
        'in your application config.',
    );
  }
}

/** Throws an error if the ssrUniqueId on the LDeferBlockDetails is not present  */
export function assertSsrIdDefined(ssrUniqueId: unknown) {
  assertDefined(
    ssrUniqueId,
    'Internal error: expecting an SSR id for a defer block that should be hydrated, but the id is not present',
  );
}

/**
 * Returns the size of an <ng-container>, using either the information
 * serialized in `ELEMENT_CONTAINERS` (element container size) or by
 * computing the sum of root nodes in all dehydrated views in a given
 * container (in case this `<ng-container>` was also used as a view
 * container host node, e.g. <ng-container *ngIf>).
 */
export function getNgContainerSize(hydrationInfo: DehydratedView, index: number): number | null {
  const data = hydrationInfo.data;
  let size = data[ELEMENT_CONTAINERS]?.[index] ?? null;
  // If there is no serialized information available in the `ELEMENT_CONTAINERS` slot,
  // check if we have info about view containers at this location (e.g.
  // `<ng-container *ngIf>`) and use container size as a number of root nodes in this
  // element container.
  if (size === null && data[CONTAINERS]?.[index]) {
    size = calcSerializedContainerSize(hydrationInfo, index);
  }
  return size;
}

export function isSerializedElementContainer(
  hydrationInfo: DehydratedView,
  index: number,
): boolean {
  return hydrationInfo.data[ELEMENT_CONTAINERS]?.[index] !== undefined;
}

export function getSerializedContainerViews(
  hydrationInfo: DehydratedView,
  index: number,
): SerializedContainerView[] | null {
  return hydrationInfo.data[CONTAINERS]?.[index] ?? null;
}

/**
 * Computes the size of a serialized container (the number of root nodes)
 * by calculating the sum of root nodes in all dehydrated views in this container.
 */
export function calcSerializedContainerSize(hydrationInfo: DehydratedView, index: number): number {
  const views = getSerializedContainerViews(hydrationInfo, index) ?? [];
  let numNodes = 0;
  for (let view of views) {
    numNodes += view[NUM_ROOT_NODES] * (view[MULTIPLIER] ?? 1);
  }
  return numNodes;
}

/**
 * Attempt to initialize the `disconnectedNodes` field of the given
 * `DehydratedView`. Returns the initialized value.
 */
export function initDisconnectedNodes(hydrationInfo: DehydratedView): Set<number> | null {
  // Check if we are processing disconnected info for the first time.
  if (typeof hydrationInfo.disconnectedNodes === 'undefined') {
    const nodeIds = hydrationInfo.data[DISCONNECTED_NODES];
    hydrationInfo.disconnectedNodes = nodeIds ? new Set(nodeIds) : null;
  }
  return hydrationInfo.disconnectedNodes;
}

/**
 * Checks whether a node is annotated as "disconnected", i.e. not present
 * in the DOM at serialization time. We should not attempt hydration for
 * such nodes and instead, use a regular "creation mode".
 */
export function isDisconnectedNode(hydrationInfo: DehydratedView, index: number): boolean {
  // Check if we are processing disconnected info for the first time.
  if (typeof hydrationInfo.disconnectedNodes === 'undefined') {
    const nodeIds = hydrationInfo.data[DISCONNECTED_NODES];
    hydrationInfo.disconnectedNodes = nodeIds ? new Set(nodeIds) : null;
  }
  return !!initDisconnectedNodes(hydrationInfo)?.has(index);
}

/**
 * Checks whether a node can be hydrated.
 * @param lView View in which the node instance is placed.
 * @param tNode Node to be checked.
 */
export function canHydrateNode(lView: LView, tNode: TNode): boolean {
  const hydrationInfo = lView[HYDRATION];

  return (
    hydrationInfo !== null &&
    !isInSkipHydrationBlock() &&
    !isDetachedByI18n(tNode) &&
    !isDisconnectedNode(hydrationInfo, tNode.index - HEADER_OFFSET)
  );
}

/**
 * Helper function to prepare text nodes for serialization by ensuring
 * that seperate logical text blocks in the DOM remain separate after
 * serialization.
 */
export function processTextNodeBeforeSerialization(context: HydrationContext, node: RNode) {
  // Handle cases where text nodes can be lost after DOM serialization:
  //  1. When there is an *empty text node* in DOM: in this case, this
  //     node would not make it into the serialized string and as a result,
  //     this node wouldn't be created in a browser. This would result in
  //     a mismatch during the hydration, where the runtime logic would expect
  //     a text node to be present in live DOM, but no text node would exist.
  //     Example: `<span>{{ name }}</span>` when the `name` is an empty string.
  //     This would result in `<span></span>` string after serialization and
  //     in a browser only the `span` element would be created. To resolve that,
  //     an extra comment node is appended in place of an empty text node and
  //     that special comment node is replaced with an empty text node *before*
  //     hydration.
  //  2. When there are 2 consecutive text nodes present in the DOM.
  //     Example: `<div>Hello <ng-container *ngIf="true">world</ng-container></div>`.
  //     In this scenario, the live DOM would look like this:
  //       <div>#text('Hello ') #text('world') #comment('container')</div>
  //     Serialized string would look like this: `<div>Hello world<!--container--></div>`.
  //     The live DOM in a browser after that would be:
  //       <div>#text('Hello world') #comment('container')</div>
  //     Notice how 2 text nodes are now "merged" into one. This would cause hydration
  //     logic to fail, since it'd expect 2 text nodes being present, not one.
  //     To fix this, we insert a special comment node in between those text nodes, so
  //     serialized representation is: `<div>Hello <!--ngtns-->world<!--container--></div>`.
  //     This forces browser to create 2 text nodes separated by a comment node.
  //     Before running a hydration process, this special comment node is removed, so the
  //     live DOM has exactly the same state as it was before serialization.

  // Collect this node as required special annotation only when its
  // contents is empty. Otherwise, such text node would be present on
  // the client after server-side rendering and no special handling needed.
  const el = node as HTMLElement;
  const corruptedTextNodes = context.corruptedTextNodes;
  if (el.textContent === '') {
    corruptedTextNodes.set(el, TextNodeMarker.EmptyNode);
  } else if (el.nextSibling?.nodeType === Node.TEXT_NODE) {
    corruptedTextNodes.set(el, TextNodeMarker.Separator);
  }
}

export function convertHydrateTriggersToJsAction(
  triggers: Map<DeferBlockTrigger, HydrateTriggerDetails | null> | null,
): string[] {
  let actionList: string[] = [];
  if (triggers !== null) {
    if (triggers.has(DeferBlockTrigger.Hover)) {
      actionList.push(...hoverEventNames);
    }
    if (triggers.has(DeferBlockTrigger.Interaction)) {
      actionList.push(...interactionEventNames);
    }
  }
  return actionList;
}

/**
 * Builds a queue of blocks that need to be hydrated, looking up the
 * tree to the topmost defer block that exists in the tree that hasn't
 * been hydrated, but exists in the registry. This queue is in top down
 * hierarchical order as a list of defer block ids.
 * Note: This is utilizing serialized information to navigate up the tree
 */
export function getParentBlockHydrationQueue(
  deferBlockId: string,
  injector: Injector,
): {parentBlockPromise: Promise<void> | null; hydrationQueue: string[]} {
  const dehydratedBlockRegistry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
  const transferState = injector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});

  let isTopMostDeferBlock = false;
  let currentBlockId: string | undefined = deferBlockId;
  let parentBlockPromise: Promise<void> | null = null;
  const hydrationQueue: string[] = [];

  while (!isTopMostDeferBlock && currentBlockId) {
    ngDevMode &&
      assertEqual(
        hydrationQueue.indexOf(currentBlockId),
        -1,
        'Internal error: defer block hierarchy has a cycle.',
      );

    isTopMostDeferBlock = dehydratedBlockRegistry.has(currentBlockId);
    const hydratingParentBlock = dehydratedBlockRegistry.hydrating.get(currentBlockId);
    if (parentBlockPromise === null && hydratingParentBlock != null) {
      parentBlockPromise = hydratingParentBlock.promise;
      break;
    }
    hydrationQueue.unshift(currentBlockId);
    currentBlockId = deferBlockParents[currentBlockId][DEFER_PARENT_BLOCK_ID];
  }
  return {parentBlockPromise, hydrationQueue};
}

function gatherDeferBlocksByJSActionAttribute(doc: Document): Set<HTMLElement> {
  const jsactionNodes = doc.body.querySelectorAll('[jsaction]');
  const blockMap = new Set<HTMLElement>();
  const eventTypes = [hoverEventNames.join(':;'), interactionEventNames.join(':;')].join('|');
  for (let node of jsactionNodes) {
    const attr = node.getAttribute('jsaction');
    const blockId = node.getAttribute('ngb');
    if (attr?.match(eventTypes) && blockId !== null) {
      blockMap.add(node as HTMLElement);
    }
  }
  return blockMap;
}

export function appendDeferBlocksToJSActionMap(doc: Document, injector: Injector) {
  const blockMap = gatherDeferBlocksByJSActionAttribute(doc);
  const jsActionMap = injector.get(JSACTION_BLOCK_ELEMENT_MAP);
  for (let rNode of blockMap) {
    sharedMapFunction(rNode, jsActionMap);
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
export function processBlockData(injector: Injector): Map<string, BlockSummary> {
  const blockData = retrieveDeferBlockData(injector);
  let blockDetails = new Map<string, BlockSummary>();
  for (let blockId in blockData) {
    blockDetails.set(blockId, createBlockSummary(blockData[blockId]));
  }
  return blockDetails;
}

function isSsrContentsIntegrity(node: ChildNode | null): boolean {
  return (
    !!node &&
    node.nodeType === Node.COMMENT_NODE &&
    node.textContent?.trim() === SSR_CONTENT_INTEGRITY_MARKER
  );
}

function skipTextNodes(node: ChildNode | null): ChildNode | null {
  // Ignore whitespace. Before the <body>, we shouldn't find text nodes that aren't whitespace.
  while (node && node.nodeType === Node.TEXT_NODE) {
    node = node.previousSibling;
  }
  return node;
}

/**
 * Verifies whether the DOM contains a special marker added during SSR time to make sure
 * there is no SSR'ed contents transformations happen after SSR is completed. Typically that
 * happens either by CDN or during the build process as an optimization to remove comment nodes.
 * Hydration process requires comment nodes produced by Angular to locate correct DOM segments.
 * When this special marker is *not* present - throw an error and do not proceed with hydration,
 * since it will not be able to function correctly.
 *
 * Note: this function is invoked only on the client, so it's safe to use DOM APIs.
 */
export function verifySsrContentsIntegrity(doc: Document): void {
  for (const node of doc.body.childNodes) {
    if (isSsrContentsIntegrity(node)) {
      return;
    }
  }

  // Check if the HTML parser may have moved the marker to just before the <body> tag,
  // e.g. because the body tag was implicit and not present in the markup. An implicit body
  // tag is unlikely to interfer with whitespace/comments inside of the app's root element.

  // Case 1: Implicit body. Example:
  //   <!doctype html><head><title>Hi</title></head><!--nghm--><app-root></app-root>
  const beforeBody = skipTextNodes(doc.body.previousSibling);
  if (isSsrContentsIntegrity(beforeBody)) {
    return;
  }

  // Case 2: Implicit body & head. Example:
  //   <!doctype html><head><title>Hi</title><!--nghm--><app-root></app-root>
  let endOfHead = skipTextNodes(doc.head.lastChild);
  if (isSsrContentsIntegrity(endOfHead)) {
    return;
  }

  throw new RuntimeError(
    RuntimeErrorCode.MISSING_SSR_CONTENT_INTEGRITY_MARKER,
    typeof ngDevMode !== 'undefined' &&
      ngDevMode &&
      'Angular hydration logic detected that HTML content of this page was modified after it ' +
        'was produced during server side rendering. Make sure that there are no optimizations ' +
        'that remove comment nodes from HTML enabled on your CDN. Angular hydration ' +
        'relies on HTML produced by the server, including whitespaces and comment nodes.',
  );
}
