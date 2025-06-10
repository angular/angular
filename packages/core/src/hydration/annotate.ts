/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '../application/application_ref';
import {APP_ID} from '../application/application_tokens';
import {
  DEFER_BLOCK_STATE as CURRENT_DEFER_BLOCK_STATE,
  DeferBlockTrigger,
  HydrateTriggerDetails,
  TDeferBlockDetails,
} from '../defer/interfaces';
import {getLDeferBlockDetails, getTDeferBlockDetails, isDeferBlock} from '../defer/utils';
import {isDetachedByI18n} from '../i18n/utils';
import {ViewEncapsulation} from '../metadata';
import {Renderer2} from '../render';
import {assertTNode} from '../render3/assert';
import {collectNativeNodes, collectNativeNodesInLContainer} from '../render3/collect_native_nodes';
import {getComponentDef} from '../render3/def_getters';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../render3/interfaces/container';
import {isLetDeclaration, isTNodeShape, TNode, TNodeType} from '../render3/interfaces/node';
import {RComment, RElement} from '../render3/interfaces/renderer_dom';
import {
  hasI18n,
  isComponentHost,
  isLContainer,
  isProjectionTNode,
  isRootView,
} from '../render3/interfaces/type_checks';
import {
  CONTEXT,
  HEADER_OFFSET,
  HOST,
  INJECTOR,
  LView,
  PARENT,
  RENDERER,
  TView,
  TVIEW,
  TViewType,
} from '../render3/interfaces/view';
import {unwrapLView, unwrapRNode} from '../render3/util/view_utils';
import {TransferState} from '../transfer_state';

import {
  unsupportedProjectionOfDomNodes,
  validateMatchingNode,
  validateNodeExists,
} from './error_handling';
import {collectDomEventsInfo} from './event_replay';
import {setJSActionAttributes} from '../event_delegation_utils';
import {
  getOrComputeI18nChildren,
  isI18nHydrationEnabled,
  isI18nHydrationSupportEnabled,
  trySerializeI18nBlock,
} from './i18n';
import {
  CONTAINERS,
  DEFER_BLOCK_ID,
  DEFER_BLOCK_STATE,
  DEFER_HYDRATE_TRIGGERS,
  DEFER_PARENT_BLOCK_ID,
  DISCONNECTED_NODES,
  ELEMENT_CONTAINERS,
  I18N_DATA,
  MULTIPLIER,
  NODES,
  NUM_ROOT_NODES,
  SerializedContainerView,
  SerializedDeferBlock,
  SerializedTriggerDetails,
  SerializedView,
  TEMPLATE_ID,
  TEMPLATES,
} from './interfaces';
import {calcPathForNode, isDisconnectedNode} from './node_lookup_utils';
import {isInSkipHydrationBlock, SKIP_HYDRATION_ATTR_NAME} from './skip_hydration';
import {EVENT_REPLAY_ENABLED_DEFAULT, IS_EVENT_REPLAY_ENABLED} from './tokens';
import {
  convertHydrateTriggersToJsAction,
  getLNodeForHydration,
  isIncrementalHydrationEnabled,
  NGH_ATTR_NAME,
  NGH_DATA_KEY,
  NGH_DEFER_BLOCKS_KEY,
  processTextNodeBeforeSerialization,
  TextNodeMarker,
} from './utils';
import {Injector} from '../di';

/**
 * A collection that tracks all serialized views (`ngh` DOM annotations)
 * to avoid duplication. An attempt to add a duplicate view results in the
 * collection returning the index of the previously collected serialized view.
 * This reduces the number of annotations needed for a given page.
 */
class SerializedViewCollection {
  private views: SerializedView[] = [];
  private indexByContent = new Map<string, number>();

  add(serializedView: SerializedView): number {
    const viewAsString = JSON.stringify(serializedView);
    if (!this.indexByContent.has(viewAsString)) {
      const index = this.views.length;
      this.views.push(serializedView);
      this.indexByContent.set(viewAsString, index);
      return index;
    }
    return this.indexByContent.get(viewAsString)!;
  }

  getAll(): SerializedView[] {
    return this.views;
  }
}

/**
 * Global counter that is used to generate a unique id for TViews
 * during the serialization process.
 */
let tViewSsrId = 0;

/**
 * Generates a unique id for a given TView and returns this id.
 * The id is also stored on this instance of a TView and reused in
 * subsequent calls.
 *
 * This id is needed to uniquely identify and pick up dehydrated views
 * at runtime.
 */
function getSsrId(tView: TView): string {
  if (!tView.ssrId) {
    tView.ssrId = `t${tViewSsrId++}`;
  }
  return tView.ssrId;
}

/**
 * Describes a context available during the serialization
 * process. The context is used to share and collect information
 * during the serialization.
 */
export interface HydrationContext {
  serializedViewCollection: SerializedViewCollection;
  corruptedTextNodes: Map<HTMLElement, TextNodeMarker>;
  isI18nHydrationEnabled: boolean;
  isIncrementalHydrationEnabled: boolean;
  i18nChildren: Map<TView, Set<number> | null>;
  eventTypesToReplay: {regular: Set<string>; capture: Set<string>};
  shouldReplayEvents: boolean;
  appId: string; // the value of `APP_ID`
  deferBlocks: Map<string /* defer block id, e.g. `d0` */, SerializedDeferBlock>;
}

/**
 * Computes the number of root nodes in a given view
 * (or child nodes in a given container if a tNode is provided).
 */
function calcNumRootNodes(tView: TView, lView: LView, tNode: TNode | null): number {
  const rootNodes: unknown[] = [];
  collectNativeNodes(tView, lView, tNode, rootNodes);
  return rootNodes.length;
}

/**
 * Computes the number of root nodes in all views in a given LContainer.
 */
function calcNumRootNodesInLContainer(lContainer: LContainer): number {
  const rootNodes: unknown[] = [];
  collectNativeNodesInLContainer(lContainer, rootNodes);
  return rootNodes.length;
}

/**
 * Annotates root level component's LView for hydration,
 * see `annotateHostElementForHydration` for additional information.
 */
function annotateComponentLViewForHydration(
  lView: LView,
  context: HydrationContext,
  injector: Injector,
): number | null {
  const hostElement = lView[HOST];
  // Root elements might also be annotated with the `ngSkipHydration` attribute,
  // check if it's present before starting the serialization process.
  if (hostElement && !(hostElement as HTMLElement).hasAttribute(SKIP_HYDRATION_ATTR_NAME)) {
    return annotateHostElementForHydration(hostElement as HTMLElement, lView, null, context);
  }
  return null;
}

/**
 * Annotates root level LContainer for hydration. This happens when a root component
 * injects ViewContainerRef, thus making the component an anchor for a view container.
 * This function serializes the component itself as well as all views from the view
 * container.
 */
function annotateLContainerForHydration(
  lContainer: LContainer,
  context: HydrationContext,
  injector: Injector,
) {
  const componentLView = unwrapLView(lContainer[HOST]) as LView<unknown>;

  // Serialize the root component itself.
  const componentLViewNghIndex = annotateComponentLViewForHydration(
    componentLView,
    context,
    injector,
  );

  if (componentLViewNghIndex === null) {
    // Component was not serialized (for example, if hydration was skipped by adding
    // the `ngSkipHydration` attribute or this component uses i18n blocks in the template,
    // but `withI18nSupport()` was not added), avoid annotating host element with the `ngh`
    // attribute.
    return;
  }

  const hostElement = unwrapRNode(componentLView[HOST]!) as HTMLElement;

  // Serialize all views within this view container.
  const rootLView = lContainer[PARENT];
  const rootLViewNghIndex = annotateHostElementForHydration(hostElement, rootLView, null, context);

  const renderer = componentLView[RENDERER] as Renderer2;

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
  const finalIndex = `${componentLViewNghIndex}|${rootLViewNghIndex}`;
  renderer.setAttribute(hostElement, NGH_ATTR_NAME, finalIndex);
}

/**
 * Annotates all components bootstrapped in a given ApplicationRef
 * with info needed for hydration.
 *
 * @param appRef An instance of an ApplicationRef.
 * @param doc A reference to the current Document instance.
 * @return event types that need to be replayed
 */
export function annotateForHydration(appRef: ApplicationRef, doc: Document) {
  const injector = appRef.injector;
  const isI18nHydrationEnabledVal = isI18nHydrationEnabled(injector);
  const isIncrementalHydrationEnabledVal = isIncrementalHydrationEnabled(injector);
  const serializedViewCollection = new SerializedViewCollection();
  const corruptedTextNodes = new Map<HTMLElement, TextNodeMarker>();
  const viewRefs = appRef._views;
  const shouldReplayEvents = injector.get(IS_EVENT_REPLAY_ENABLED, EVENT_REPLAY_ENABLED_DEFAULT);
  const eventTypesToReplay = {
    regular: new Set<string>(),
    capture: new Set<string>(),
  };
  const deferBlocks = new Map<string, SerializedDeferBlock>();
  const appId = appRef.injector.get(APP_ID);
  for (const viewRef of viewRefs) {
    const lNode = getLNodeForHydration(viewRef);

    // An `lView` might be `null` if a `ViewRef` represents
    // an embedded view (not a component view).
    if (lNode !== null) {
      const context: HydrationContext = {
        serializedViewCollection,
        corruptedTextNodes,
        isI18nHydrationEnabled: isI18nHydrationEnabledVal,
        isIncrementalHydrationEnabled: isIncrementalHydrationEnabledVal,
        i18nChildren: new Map(),
        eventTypesToReplay,
        shouldReplayEvents,
        appId,
        deferBlocks,
      };
      if (isLContainer(lNode)) {
        annotateLContainerForHydration(lNode, context, injector);
      } else {
        annotateComponentLViewForHydration(lNode, context, injector);
      }
      insertCorruptedTextNodeMarkers(corruptedTextNodes, doc);
    }
  }

  // Note: we *always* include hydration info key and a corresponding value
  // into the TransferState, even if the list of serialized views is empty.
  // This is needed as a signal to the client that the server part of the
  // hydration logic was setup and enabled correctly. Otherwise, if a client
  // hydration doesn't find a key in the transfer state - an error is produced.
  const serializedViews = serializedViewCollection.getAll();
  const transferState = injector.get(TransferState);
  transferState.set(NGH_DATA_KEY, serializedViews);

  if (deferBlocks.size > 0) {
    const blocks: {[key: string]: SerializedDeferBlock} = {};
    for (const [id, info] of deferBlocks.entries()) {
      blocks[id] = info;
    }
    transferState.set(NGH_DEFER_BLOCKS_KEY, blocks);
  }

  return eventTypesToReplay;
}

/**
 * Serializes the lContainer data into a list of SerializedView objects,
 * that represent views within this lContainer.
 *
 * @param lContainer the lContainer we are serializing
 * @param tNode the TNode that contains info about this LContainer
 * @param lView that hosts this LContainer
 * @param parentDeferBlockId the defer block id of the parent if it exists
 * @param context the hydration context
 * @returns an array of the `SerializedView` objects
 */
function serializeLContainer(
  lContainer: LContainer,
  tNode: TNode,
  lView: LView,
  parentDeferBlockId: string | null,
  context: HydrationContext,
): SerializedContainerView[] {
  const views: SerializedContainerView[] = [];
  let lastViewAsString = '';

  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    let childLView = lContainer[i] as LView;

    let template: string;
    let numRootNodes: number;
    let serializedView: SerializedContainerView | undefined;

    if (isRootView(childLView)) {
      // If this is a root view, get an LView for the underlying component,
      // because it contains information about the view to serialize.
      childLView = childLView[HEADER_OFFSET];

      // If we have an LContainer at this position, this indicates that the
      // host element was used as a ViewContainerRef anchor (e.g. a `ViewContainerRef`
      // was injected within the component class). This case requires special handling.
      if (isLContainer(childLView)) {
        // Calculate the number of root nodes in all views in a given container
        // and increment by one to account for an anchor node itself, i.e. in this
        // scenario we'll have a layout that would look like this:
        // `<app-root /><#VIEW1><#VIEW2>...<!--container-->`
        // The `+1` is to capture the `<app-root />` element.
        numRootNodes = calcNumRootNodesInLContainer(childLView) + 1;

        annotateLContainerForHydration(childLView, context, lView[INJECTOR]);

        const componentLView = unwrapLView(childLView[HOST]) as LView<unknown>;

        serializedView = {
          [TEMPLATE_ID]: componentLView[TVIEW].ssrId!,
          [NUM_ROOT_NODES]: numRootNodes,
        };
      }
    }

    if (!serializedView) {
      const childTView = childLView[TVIEW];

      if (childTView.type === TViewType.Component) {
        template = childTView.ssrId!;

        // This is a component view, thus it has only 1 root node: the component
        // host node itself (other nodes would be inside that host node).
        numRootNodes = 1;
      } else {
        template = getSsrId(childTView);
        numRootNodes = calcNumRootNodes(childTView, childLView, childTView.firstChild);
      }

      serializedView = {
        [TEMPLATE_ID]: template,
        [NUM_ROOT_NODES]: numRootNodes,
      };

      let isHydrateNeverBlock = false;

      // If this is a defer block, serialize extra info.
      if (isDeferBlock(lView[TVIEW], tNode)) {
        const lDetails = getLDeferBlockDetails(lView, tNode);
        const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);

        if (context.isIncrementalHydrationEnabled && tDetails.hydrateTriggers !== null) {
          const deferBlockId = `d${context.deferBlocks.size}`;

          if (tDetails.hydrateTriggers.has(DeferBlockTrigger.Never)) {
            isHydrateNeverBlock = true;
          }

          let rootNodes: any[] = [];
          collectNativeNodesInLContainer(lContainer, rootNodes);

          // Add defer block into info context.deferBlocks
          const deferBlockInfo: SerializedDeferBlock = {
            [NUM_ROOT_NODES]: rootNodes.length,
            [DEFER_BLOCK_STATE]: lDetails[CURRENT_DEFER_BLOCK_STATE],
          };

          const serializedTriggers = serializeHydrateTriggers(tDetails.hydrateTriggers);
          if (serializedTriggers.length > 0) {
            deferBlockInfo[DEFER_HYDRATE_TRIGGERS] = serializedTriggers;
          }

          if (parentDeferBlockId !== null) {
            // Serialize parent id only when it's present.
            deferBlockInfo[DEFER_PARENT_BLOCK_ID] = parentDeferBlockId;
          }

          context.deferBlocks.set(deferBlockId, deferBlockInfo);

          const node = unwrapRNode(lContainer);
          if (node !== undefined) {
            if ((node as Node).nodeType === Node.COMMENT_NODE) {
              annotateDeferBlockAnchorForHydration(node as RComment, deferBlockId);
            }
          } else {
            ngDevMode && validateNodeExists(node, childLView, tNode);
            ngDevMode &&
              validateMatchingNode(node, Node.COMMENT_NODE, null, childLView, tNode, true);

            annotateDeferBlockAnchorForHydration(node as RComment, deferBlockId);
          }

          if (!isHydrateNeverBlock) {
            // Add JSAction attributes for root nodes that use some hydration triggers
            annotateDeferBlockRootNodesWithJsAction(tDetails, rootNodes, deferBlockId, context);
          }

          // Use current block id as parent for nested routes.
          parentDeferBlockId = deferBlockId;

          // Serialize extra info into the view object.
          // TODO(incremental-hydration): this should be serialized and included at a different level
          // (not at the view level).
          serializedView[DEFER_BLOCK_ID] = deferBlockId;
        }
        // DEFER_BLOCK_STATE is used for reconciliation in hydration, both regular and incremental.
        // We need to know which template is rendered when hydrating. So we serialize this state
        // regardless of hydration type.
        serializedView[DEFER_BLOCK_STATE] = lDetails[CURRENT_DEFER_BLOCK_STATE];
      }

      if (!isHydrateNeverBlock) {
        Object.assign(
          serializedView,
          serializeLView(lContainer[i] as LView, parentDeferBlockId, context),
        );
      }
    }

    // Check if the previous view has the same shape (for example, it was
    // produced by the *ngFor), in which case bump the counter on the previous
    // view instead of including the same information again.
    const currentViewAsString = JSON.stringify(serializedView);
    if (views.length > 0 && currentViewAsString === lastViewAsString) {
      const previousView = views[views.length - 1];
      previousView[MULTIPLIER] ??= 1;
      previousView[MULTIPLIER]++;
    } else {
      // Record this view as most recently added.
      lastViewAsString = currentViewAsString;
      views.push(serializedView);
    }
  }
  return views;
}

function serializeHydrateTriggers(
  triggerMap: Map<DeferBlockTrigger, HydrateTriggerDetails | null>,
): (DeferBlockTrigger | SerializedTriggerDetails)[] {
  const serializableDeferBlockTrigger = new Set<DeferBlockTrigger>([
    DeferBlockTrigger.Idle,
    DeferBlockTrigger.Immediate,
    DeferBlockTrigger.Viewport,
    DeferBlockTrigger.Timer,
  ]);
  let triggers: (DeferBlockTrigger | SerializedTriggerDetails)[] = [];
  for (let [trigger, details] of triggerMap) {
    if (serializableDeferBlockTrigger.has(trigger)) {
      if (details === null) {
        triggers.push(trigger);
      } else {
        triggers.push({trigger, delay: details.delay});
      }
    }
  }
  return triggers;
}

/**
 * Helper function to produce a node path (which navigation steps runtime logic
 * needs to take to locate a node) and stores it in the `NODES` section of the
 * current serialized view.
 */
function appendSerializedNodePath(
  ngh: SerializedView,
  tNode: TNode,
  lView: LView,
  excludedParentNodes: Set<number> | null,
) {
  const noOffsetIndex = tNode.index - HEADER_OFFSET;
  ngh[NODES] ??= {};
  // Ensure we don't calculate the path multiple times.
  ngh[NODES][noOffsetIndex] ??= calcPathForNode(tNode, lView, excludedParentNodes);
}

/**
 * Helper function to append information about a disconnected node.
 * This info is needed at runtime to avoid DOM lookups for this element
 * and instead, the element would be created from scratch.
 */
function appendDisconnectedNodeIndex(ngh: SerializedView, tNodeOrNoOffsetIndex: TNode | number) {
  const noOffsetIndex =
    typeof tNodeOrNoOffsetIndex === 'number'
      ? tNodeOrNoOffsetIndex
      : tNodeOrNoOffsetIndex.index - HEADER_OFFSET;
  ngh[DISCONNECTED_NODES] ??= [];
  if (!ngh[DISCONNECTED_NODES].includes(noOffsetIndex)) {
    ngh[DISCONNECTED_NODES].push(noOffsetIndex);
  }
}

/**
 * Serializes the lView data into a SerializedView object that will later be added
 * to the TransferState storage and referenced using the `ngh` attribute on a host
 * element.
 *
 * @param lView the lView we are serializing
 * @param context the hydration context
 * @returns the `SerializedView` object containing the data to be added to the host node
 */
function serializeLView(
  lView: LView,
  parentDeferBlockId: string | null = null,
  context: HydrationContext,
): SerializedView {
  const ngh: SerializedView = {};
  const tView = lView[TVIEW];
  const i18nChildren = getOrComputeI18nChildren(tView, context);
  const nativeElementsToEventTypes = context.shouldReplayEvents
    ? collectDomEventsInfo(tView, lView, context.eventTypesToReplay)
    : null;
  // Iterate over DOM element references in an LView.
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    const tNode = tView.data[i];
    const noOffsetIndex = i - HEADER_OFFSET;

    // Attempt to serialize any i18n data for the given slot. We do this first, as i18n
    // has its own process for serialization.
    const i18nData = trySerializeI18nBlock(lView, i, context);
    if (i18nData) {
      ngh[I18N_DATA] ??= {};
      ngh[I18N_DATA][noOffsetIndex] = i18nData.caseQueue;

      for (const nodeNoOffsetIndex of i18nData.disconnectedNodes) {
        appendDisconnectedNodeIndex(ngh, nodeNoOffsetIndex);
      }

      for (const nodeNoOffsetIndex of i18nData.disjointNodes) {
        const tNode = tView.data[nodeNoOffsetIndex + HEADER_OFFSET] as TNode;
        ngDevMode && assertTNode(tNode);
        appendSerializedNodePath(ngh, tNode, lView, i18nChildren);
      }

      continue;
    }

    // Skip processing of a given slot in the following cases:
    // - Local refs (e.g. <div #localRef>) take up an extra slot in LViews
    //   to store the same element. In this case, there is no information in
    //   a corresponding slot in TNode data structure.
    // - When a slot contains something other than a TNode. For example, there
    //   might be some metadata information about a defer block or a control flow block.
    if (!isTNodeShape(tNode)) {
      continue;
    }

    // Skip any nodes that are in an i18n block but are considered detached (i.e. not
    // present in the template). These nodes are disconnected from the DOM tree, and
    // so we don't want to serialize any information about them.
    if (isDetachedByI18n(tNode)) {
      continue;
    }

    // Serialize information about template.
    if (isLContainer(lView[i]) && tNode.tView) {
      ngh[TEMPLATES] ??= {};
      ngh[TEMPLATES][noOffsetIndex] = getSsrId(tNode.tView!);
    }

    // Check if a native node that represents a given TNode is disconnected from the DOM tree.
    // Such nodes must be excluded from the hydration (since the hydration won't be able to
    // find them), so the TNode ids are collected and used at runtime to skip the hydration.
    // This situation may happen during the content projection, when some nodes don't make it
    // into one of the content projection slots (for example, when there is no default
    // <ng-content /> slot in projector component's template).
    if (isDisconnectedNode(tNode, lView) && isContentProjectedNode(tNode)) {
      appendDisconnectedNodeIndex(ngh, tNode);
      continue;
    }

    if (Array.isArray(tNode.projection)) {
      for (const projectionHeadTNode of tNode.projection) {
        // We may have `null`s in slots with no projected content.
        if (!projectionHeadTNode) continue;

        if (!Array.isArray(projectionHeadTNode)) {
          // If we process re-projected content (i.e. `<ng-content>`
          // appears at projection location), skip annotations for this content
          // since all DOM nodes in this projection were handled while processing
          // a parent lView, which contains those nodes.
          if (
            !isProjectionTNode(projectionHeadTNode) &&
            !isInSkipHydrationBlock(projectionHeadTNode)
          ) {
            if (isDisconnectedNode(projectionHeadTNode, lView)) {
              // Check whether this node is connected, since we may have a TNode
              // in the data structure as a projection segment head, but the
              // content projection slot might be disabled (e.g.
              // <ng-content *ngIf="false" />).
              appendDisconnectedNodeIndex(ngh, projectionHeadTNode);
            } else {
              appendSerializedNodePath(ngh, projectionHeadTNode, lView, i18nChildren);
            }
          }
        } else {
          // If a value is an array, it means that we are processing a projection
          // where projectable nodes were passed in as DOM nodes (for example, when
          // calling `ViewContainerRef.createComponent(CmpA, {projectableNodes: [...]})`).
          //
          // In this scenario, nodes can come from anywhere (either created manually,
          // accessed via `document.querySelector`, etc) and may be in any state
          // (attached or detached from the DOM tree). As a result, we can not reliably
          // restore the state for such cases during hydration.

          throw unsupportedProjectionOfDomNodes(unwrapRNode(lView[i]));
        }
      }
    }

    conditionallyAnnotateNodePath(ngh, tNode, lView, i18nChildren);
    if (isLContainer(lView[i])) {
      // Serialize views within this LContainer.
      const hostNode = lView[i][HOST]!; // host node of this container

      // LView[i][HOST] can be of 2 different types:
      // - either a DOM node
      // - or an array that represents an LView of a component
      if (Array.isArray(hostNode)) {
        // This is a component, serialize info about it.
        const targetNode = unwrapRNode(hostNode as LView) as RElement;
        if (!(targetNode as HTMLElement).hasAttribute(SKIP_HYDRATION_ATTR_NAME)) {
          annotateHostElementForHydration(
            targetNode,
            hostNode as LView,
            parentDeferBlockId,
            context,
          );
        }
      }

      ngh[CONTAINERS] ??= {};
      ngh[CONTAINERS][noOffsetIndex] = serializeLContainer(
        lView[i],
        tNode,
        lView,
        parentDeferBlockId,
        context,
      );
    } else if (Array.isArray(lView[i]) && !isLetDeclaration(tNode)) {
      // This is a component, annotate the host node with an `ngh` attribute.
      // Note: Let declarations that return an array are also storing an array in the LView,
      // we need to exclude them.
      const targetNode = unwrapRNode(lView[i][HOST]!);
      if (!(targetNode as HTMLElement).hasAttribute(SKIP_HYDRATION_ATTR_NAME)) {
        annotateHostElementForHydration(
          targetNode as RElement,
          lView[i],
          parentDeferBlockId,
          context,
        );
      }
    } else {
      // <ng-container> case
      if (tNode.type & TNodeType.ElementContainer) {
        // An <ng-container> is represented by the number of
        // top-level nodes. This information is needed to skip over
        // those nodes to reach a corresponding anchor node (comment node).
        ngh[ELEMENT_CONTAINERS] ??= {};
        ngh[ELEMENT_CONTAINERS][noOffsetIndex] = calcNumRootNodes(tView, lView, tNode.child);
      } else if (tNode.type & (TNodeType.Projection | TNodeType.LetDeclaration)) {
        // Current TNode represents an `<ng-content>` slot or `@let` declaration,
        // thus it has no DOM elements associated with it, so the **next sibling**
        // node would not be able to find an anchor. In this case, use full path instead.
        let nextTNode = tNode.next;
        // Skip over all `<ng-content>` slots and `@let` declarations in a row.
        while (
          nextTNode !== null &&
          nextTNode.type & (TNodeType.Projection | TNodeType.LetDeclaration)
        ) {
          nextTNode = nextTNode.next;
        }
        if (nextTNode && !isInSkipHydrationBlock(nextTNode)) {
          // Handle a tNode after the `<ng-content>` slot.
          appendSerializedNodePath(ngh, nextTNode, lView, i18nChildren);
        }
      } else if (tNode.type & TNodeType.Text) {
        const rNode = unwrapRNode(lView[i]);
        processTextNodeBeforeSerialization(context, rNode);
      }
    }

    // Attach `jsaction` attribute to elements that have registered listeners,
    // thus potentially having a need to do an event replay.
    if (nativeElementsToEventTypes && tNode.type & TNodeType.Element) {
      const nativeElement = unwrapRNode(lView[i]) as Element;
      if (nativeElementsToEventTypes.has(nativeElement)) {
        setJSActionAttributes(
          nativeElement,
          nativeElementsToEventTypes.get(nativeElement)!,
          parentDeferBlockId,
        );
      }
    }
  }
  return ngh;
}

/**
 * Serializes node location in cases when it's needed, specifically:
 *
 *  1. If `tNode.projectionNext` is different from `tNode.next` - it means that
 *     the next `tNode` after projection is different from the one in the original
 *     template. Since hydration relies on `tNode.next`, this serialized info
 *     is required to help runtime code find the node at the correct location.
 *  2. In certain content projection-based use-cases, it's possible that only
 *     a content of a projected element is rendered. In this case, content nodes
 *     require an extra annotation, since runtime logic can't rely on parent-child
 *     connection to identify the location of a node.
 */
function conditionallyAnnotateNodePath(
  ngh: SerializedView,
  tNode: TNode,
  lView: LView<unknown>,
  excludedParentNodes: Set<number> | null,
) {
  if (isProjectionTNode(tNode)) {
    // Do not annotate projection nodes (<ng-content />), since
    // they don't have a corresponding DOM node representing them.
    return;
  }

  // Handle case #1 described above.
  if (
    tNode.projectionNext &&
    tNode.projectionNext !== tNode.next &&
    !isInSkipHydrationBlock(tNode.projectionNext)
  ) {
    appendSerializedNodePath(ngh, tNode.projectionNext, lView, excludedParentNodes);
  }

  // Handle case #2 described above.
  // Note: we only do that for the first node (i.e. when `tNode.prev === null`),
  // the rest of the nodes would rely on the current node location, so no extra
  // annotation is needed.
  if (
    tNode.prev === null &&
    tNode.parent !== null &&
    isDisconnectedNode(tNode.parent, lView) &&
    !isDisconnectedNode(tNode, lView)
  ) {
    appendSerializedNodePath(ngh, tNode, lView, excludedParentNodes);
  }
}

/**
 * Determines whether a component instance that is represented
 * by a given LView uses `ViewEncapsulation.ShadowDom`.
 */
function componentUsesShadowDomEncapsulation(lView: LView): boolean {
  const instance = lView[CONTEXT];
  return instance?.constructor
    ? getComponentDef(instance.constructor)?.encapsulation === ViewEncapsulation.ShadowDom
    : false;
}

/**
 * Annotates component host element for hydration:
 * - by either adding the `ngh` attribute and collecting hydration-related info
 *   for the serialization and transferring to the client
 * - or by adding the `ngSkipHydration` attribute in case Angular detects that
 *   component contents is not compatible with hydration.
 *
 * @param element The Host element to be annotated
 * @param lView The associated LView
 * @param context The hydration context
 * @returns An index of serialized view from the transfer state object
 *          or `null` when a given component can not be serialized.
 */
function annotateHostElementForHydration(
  element: RElement,
  lView: LView,
  parentDeferBlockId: string | null,
  context: HydrationContext,
): number | null {
  const renderer = lView[RENDERER];
  if (
    (hasI18n(lView) && !isI18nHydrationSupportEnabled()) ||
    componentUsesShadowDomEncapsulation(lView)
  ) {
    // Attach the skip hydration attribute if this component:
    // - either has i18n blocks, since hydrating such blocks is not yet supported
    // - or uses ShadowDom view encapsulation, since Domino doesn't support
    //   shadow DOM, so we can not guarantee that client and server representations
    //   would exactly match
    renderer.setAttribute(element, SKIP_HYDRATION_ATTR_NAME, '');
    return null;
  } else {
    const ngh = serializeLView(lView, parentDeferBlockId, context);
    const index = context.serializedViewCollection.add(ngh);
    renderer.setAttribute(element, NGH_ATTR_NAME, index.toString());
    return index;
  }
}

/**
 * Annotates defer block comment node for hydration:
 *
 * @param comment The Host element to be annotated
 * @param deferBlockId the id of the target defer block
 */
function annotateDeferBlockAnchorForHydration(comment: RComment, deferBlockId: string): void {
  comment.textContent = `ngh=${deferBlockId}`;
}

/**
 * Physically inserts the comment nodes to ensure empty text nodes and adjacent
 * text node separators are preserved after server serialization of the DOM.
 * These get swapped back for empty text nodes or separators once hydration happens
 * on the client.
 *
 * @param corruptedTextNodes The Map of text nodes to be replaced with comments
 * @param doc The document
 */
function insertCorruptedTextNodeMarkers(
  corruptedTextNodes: Map<HTMLElement, string>,
  doc: Document,
) {
  for (const [textNode, marker] of corruptedTextNodes) {
    textNode.after(doc.createComment(marker));
  }
}

/**
 * Detects whether a given TNode represents a node that
 * is being content projected.
 */
function isContentProjectedNode(tNode: TNode): boolean {
  let currentTNode = tNode;
  while (currentTNode != null) {
    // If we come across a component host node in parent nodes -
    // this TNode is in the content projection section.
    if (isComponentHost(currentTNode)) {
      return true;
    }
    currentTNode = currentTNode.parent as TNode;
  }
  return false;
}

/**
 * Incremental hydration requires that any defer block root node
 * with interaction or hover triggers have all of their root nodes
 * trigger hydration with those events. So we need to make sure all
 * the root nodes of that block have the proper jsaction attribute
 * to ensure hydration is triggered, since the content is dehydrated
 */
function annotateDeferBlockRootNodesWithJsAction(
  tDetails: TDeferBlockDetails,
  rootNodes: any[],
  parentDeferBlockId: string,
  context: HydrationContext,
) {
  const actionList = convertHydrateTriggersToJsAction(tDetails.hydrateTriggers);
  for (let et of actionList) {
    context.eventTypesToReplay.regular.add(et);
  }

  if (actionList.length > 0) {
    const elementNodes = (rootNodes as HTMLElement[]).filter(
      (rn) => rn.nodeType === Node.ELEMENT_NODE,
    );
    for (let rNode of elementNodes) {
      setJSActionAttributes(rNode, actionList, parentDeferBlockId);
    }
  }
}
