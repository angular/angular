/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import type {ViewRef} from '../linker/view_ref';
import {getComponent} from '../render3/util/discovery_utils';
import {LContainer} from '../render3/interfaces/container';
import {getDocument} from '../render3/interfaces/document';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {isRootView} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, LView, TVIEW, TViewType} from '../render3/interfaces/view';
import {makeStateKey, TransferState} from '../transfer_state';
import {assertDefined} from '../util/assert';
import type {HydrationContext} from './annotate';
import {DeferBlockRegistry, onDeferBlockCompletion, triggerDeferBlock} from '../defer/instructions';
import {getLDeferBlockDetails} from '../defer/utils';

import {
  CONTAINERS,
  DehydratedView,
  DISCONNECTED_NODES,
  ELEMENT_CONTAINERS,
  MULTIPLIER,
  NUM_ROOT_NODES,
  SerializedContainerView,
  SerializedView,
} from './interfaces';
import {ApplicationRef} from '../core';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from '../errors';

/**
 * The name of the key used in the TransferState collection,
 * where hydration information is located.
 */
const TRANSFER_STATE_TOKEN_ID = '__nghData__';

/**
 * Lookup key used to reference DOM hydration data (ngh) in `TransferState`.
 */
export const NGH_DATA_KEY = makeStateKey<Array<SerializedView>>(TRANSFER_STATE_TOKEN_ID);

/**
 * The name of the key used in the TransferState collection,
 * where serialized defer block information is located.
 *
 * TODO: consider updating '__nghData__' key and change value format
 * from an array to an object.
 */
const TRANSFER_STATE_DEFER_BLOCKS_INFO = '__nghDeferBlocks__';

/**
 * Lookup key used to retrieve defer block datain `TransferState`.
 */
export const NGH_DEFER_BLOCKS_KEY = makeStateKey<{[key: string]: string | null}>(
  TRANSFER_STATE_DEFER_BLOCKS_INFO,
);

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
};

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

/**
 * Finds first hydrated parent `@defer` block for a given block id.
 * If there are any dehydrated `@defer` blocks found along the way,
 * they are also stored and returned from the function (as a list of ids).
 */
export function findFirstKnownParentDeferBlock(deferBlockId: string, appRef: ApplicationRef) {
  const deferBlockRegistry = appRef.injector.get(DeferBlockRegistry);
  const transferState = appRef.injector.get(TransferState);
  const deferBlockParents = transferState.get(NGH_DEFER_BLOCKS_KEY, {});
  const dehydratedBlocks: string[] = [];

  let deferBlock = deferBlockRegistry.get(deferBlockId) ?? null;
  let currentBlockId: string | null = deferBlockId;
  while (!deferBlock) {
    dehydratedBlocks.unshift(currentBlockId);
    currentBlockId = deferBlockParents[currentBlockId];
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
  appRef: ApplicationRef,
  blockName: string,
  hydratedBlocks: Set<string>,
): Promise<void> {
  const deferBlockRegistry = appRef.injector.get(DeferBlockRegistry);

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return;

  const {blockId, deferBlock, dehydratedBlocks} = findFirstKnownParentDeferBlock(blockName, appRef);
  if (deferBlock && blockId) {
    hydratedBlocks.add(blockId);
    deferBlockRegistry.hydrating.add(blockId);

    await triggerAndWaitForCompletion(deferBlock);
    for (const dehydratedBlock of dehydratedBlocks) {
      await hydrateFromBlockNameImpl(appRef, dehydratedBlock, hydratedBlocks);
    }
  } else {
    // TODO: this is likely an error, consider producing a `console.error`.
  }
}

export async function hydrateFromBlockName(
  appRef: ApplicationRef,
  blockName: string,
): Promise<Set<string>> {
  const deferBlockRegistry = appRef.injector.get(DeferBlockRegistry);
  const hydratedBlocks = new Set<string>();

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (deferBlockRegistry.hydrating.has(blockName)) return hydratedBlocks;

  await hydrateFromBlockNameImpl(appRef, blockName, hydratedBlocks);
  return hydratedBlocks;
}
