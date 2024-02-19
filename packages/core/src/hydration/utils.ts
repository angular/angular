/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import type {ViewRef} from '../linker/view_ref';
import {LContainer} from '../render3/interfaces/container';
import {getDocument} from '../render3/interfaces/document';
import {RElement, RNode} from '../render3/interfaces/renderer_dom';
import {isRootView} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, LView, TVIEW, TViewType} from '../render3/interfaces/view';
import {makeStateKey, TransferState} from '../transfer_state';
import {assertDefined} from '../util/assert';

import {CONTAINERS, DehydratedView, DISCONNECTED_NODES, ELEMENT_CONTAINERS, MULTIPLIER, NUM_ROOT_NODES, SerializedContainerView, SerializedView,} from './interfaces';

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
    ): DehydratedView|null {
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
    ): DehydratedView|null {
  return _retrieveHydrationInfoImpl(rNode, injector, isRootView);
}

/**
 * Retrieves the necessary object from a given ViewRef to serialize:
 *  - an LView for component views
 *  - an LContainer for cases when component acts as a ViewContainerRef anchor
 *  - `null` in case of an embedded view
 */
export function getLNodeForHydration(viewRef: ViewRef): LView|LContainer|null {
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

function getTextNodeContent(node: Node): string|undefined {
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

// clang-format off
export type HydrationInfo = {
  status: HydrationStatus.Hydrated|HydrationStatus.Skipped;
}|{
  status: HydrationStatus.Mismatched;
  actualNodeDetails: string|null;
  expectedNodeDetails: string|null
};
// clang-format on

const HYDRATION_INFO_KEY = '__ngDebugHydrationInfo__';

export type HydratedNode = {
  [HYDRATION_INFO_KEY]?: HydrationInfo;
};

function patchHydrationInfo(node: RNode, info: HydrationInfo) {
  (node as HydratedNode)[HYDRATION_INFO_KEY] = info;
}

export function readHydrationInfo(node: RNode): HydrationInfo|null {
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
    expectedNodeDetails: string|null = null,
    actualNodeDetails: string|null = null,
) {
  if (!ngDevMode) {
    throw new Error(
        'Calling `markRNodeAsMismatchedByHydration` in prod mode ' +
            'is not supported and likely a mistake.',
    );
  }

  // The RNode can be a standard HTMLElement
  // The devtools component tree only displays Angular components & directives
  // Therefore we attach the debug info to the closest a claimed node.
  while (node && readHydrationInfo(node)?.status !== HydrationStatus.Hydrated) {
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
    node: RNode|null,
    ): void {
  hydrationInfo.segmentHeads ??= {};
  hydrationInfo.segmentHeads[index] = node;
}

export function getSegmentHead(hydrationInfo: DehydratedView, index: number): RNode|null {
  return hydrationInfo.segmentHeads?.[index] ?? null;
}

/**
 * Returns the size of an <ng-container>, using either the information
 * serialized in `ELEMENT_CONTAINERS` (element container size) or by
 * computing the sum of root nodes in all dehydrated views in a given
 * container (in case this `<ng-container>` was also used as a view
 * container host node, e.g. <ng-container *ngIf>).
 */
export function getNgContainerSize(hydrationInfo: DehydratedView, index: number): number|null {
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

export function getSerializedContainerViews(
    hydrationInfo: DehydratedView,
    index: number,
    ): SerializedContainerView[]|null {
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
  return !!hydrationInfo.disconnectedNodes?.has(index);
}
