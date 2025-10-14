/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import type { ViewRef } from '../linker/view_ref';
import { LContainer } from '../render3/interfaces/container';
import { RElement, RNode } from '../render3/interfaces/renderer_dom';
import { LView } from '../render3/interfaces/view';
import { StateKey } from '../transfer_state';
import type { HydrationContext } from './annotate';
import { BlockSummary, DehydratedView, SerializedContainerView, SerializedDeferBlock, SerializedView } from './interfaces';
import { DeferBlockTrigger, HydrateTriggerDetails } from '../defer/interfaces';
import { TNode } from '../render3/interfaces/node';
/**
 * Lookup key used to reference DOM hydration data (ngh) in `TransferState`.
 */
export declare const NGH_DATA_KEY: StateKey<SerializedView[]>;
/**
 * The name of the key used in the TransferState collection,
 * where serialized defer block information is located.
 */
export declare const TRANSFER_STATE_DEFER_BLOCKS_INFO = "__nghDeferData__";
/**
 * Lookup key used to retrieve defer block datain `TransferState`.
 */
export declare const NGH_DEFER_BLOCKS_KEY: StateKey<{
    [key: string]: SerializedDeferBlock;
}>;
/**
 * Checks whether a given key is used by the framework for transferring hydration data.
 */
export declare function isInternalHydrationTransferStateKey(key: string): boolean;
/**
 * The name of the attribute that would be added to host component
 * nodes and contain a reference to a particular slot in transferred
 * state that contains the necessary hydration info for this component.
 */
export declare const NGH_ATTR_NAME = "ngh";
/**
 * Marker used in a comment node to ensure hydration content integrity
 */
export declare const SSR_CONTENT_INTEGRITY_MARKER = "nghm";
export declare const enum TextNodeMarker {
    /**
     * The contents of the text comment added to nodes that would otherwise be
     * empty when serialized by the server and passed to the client. The empty
     * node is lost when the browser parses it otherwise. This comment node will
     * be replaced during hydration in the client to restore the lost empty text
     * node.
     */
    EmptyNode = "ngetn",
    /**
     * The contents of the text comment added in the case of adjacent text nodes.
     * When adjacent text nodes are serialized by the server and sent to the
     * client, the browser loses reference to the amount of nodes and assumes
     * just one text node. This separator is replaced during hydration to restore
     * the proper separation and amount of text nodes that should be present.
     */
    Separator = "ngtns"
}
export declare function retrieveHydrationInfoImpl(rNode: RElement, injector: Injector, isRootView?: boolean): DehydratedView | null;
/**
 * Sets the implementation for the `retrieveHydrationInfo` function.
 */
export declare function enableRetrieveHydrationInfoImpl(): void;
/**
 * Retrieves hydration info by reading the value from the `ngh` attribute
 * and accessing a corresponding slot in TransferState storage.
 */
export declare function retrieveHydrationInfo(rNode: RElement, injector: Injector, isRootView?: boolean): DehydratedView | null;
/**
 * Retrieves the necessary object from a given ViewRef to serialize:
 *  - an LView for component views
 *  - an LContainer for cases when component acts as a ViewContainerRef anchor
 *  - `null` in case of an embedded view
 */
export declare function getLNodeForHydration(viewRef: ViewRef): LView | LContainer | null;
/**
 * Restores text nodes and separators into the DOM that were lost during SSR
 * serialization. The hydration process replaces empty text nodes and text
 * nodes that are immediately adjacent to other text nodes with comment nodes
 * that this method filters on to restore those missing nodes that the
 * hydration process is expecting to be present.
 *
 * @param node The app's root HTML Element
 */
export declare function processTextNodeMarkersBeforeHydration(node: HTMLElement): void;
/**
 * Internal type that represents a claimed node.
 * Only used in dev mode.
 */
export declare enum HydrationStatus {
    Hydrated = "hydrated",
    Skipped = "skipped",
    Mismatched = "mismatched"
}
export type HydrationInfo = {
    status: HydrationStatus.Hydrated | HydrationStatus.Skipped;
} | {
    status: HydrationStatus.Mismatched;
    actualNodeDetails: string | null;
    expectedNodeDetails: string | null;
};
declare const HYDRATION_INFO_KEY = "__ngDebugHydrationInfo__";
export type HydratedNode = {
    [HYDRATION_INFO_KEY]?: HydrationInfo;
} & Element;
export declare function readHydrationInfo(node: RNode): HydrationInfo | null;
/**
 * Marks a node as "claimed" by hydration process.
 * This is needed to make assessments in tests whether
 * the hydration process handled all nodes.
 */
export declare function markRNodeAsClaimedByHydration(node: RNode, checkIfAlreadyClaimed?: boolean): void;
export declare function markRNodeAsSkippedByHydration(node: RNode): void;
export declare function countBlocksSkippedByHydration(injector: Injector): void;
export declare function markRNodeAsHavingHydrationMismatch(node: RNode, expectedNodeDetails?: string | null, actualNodeDetails?: string | null): void;
export declare function isRNodeClaimedForHydration(node: RNode): boolean;
export declare function setSegmentHead(hydrationInfo: DehydratedView, index: number, node: RNode | null): void;
export declare function getSegmentHead(hydrationInfo: DehydratedView, index: number): RNode | null;
export declare function isIncrementalHydrationEnabled(injector: Injector): boolean;
/** Throws an error if the incremental hydration is not enabled */
export declare function assertIncrementalHydrationIsConfigured(injector: Injector): void;
/** Throws an error if the ssrUniqueId on the LDeferBlockDetails is not present  */
export declare function assertSsrIdDefined(ssrUniqueId: unknown): void;
/**
 * Returns the size of an <ng-container>, using either the information
 * serialized in `ELEMENT_CONTAINERS` (element container size) or by
 * computing the sum of root nodes in all dehydrated views in a given
 * container (in case this `<ng-container>` was also used as a view
 * container host node, e.g. <ng-container *ngIf>).
 */
export declare function getNgContainerSize(hydrationInfo: DehydratedView, index: number): number | null;
export declare function isSerializedElementContainer(hydrationInfo: DehydratedView, index: number): boolean;
export declare function getSerializedContainerViews(hydrationInfo: DehydratedView, index: number): SerializedContainerView[] | null;
/**
 * Computes the size of a serialized container (the number of root nodes)
 * by calculating the sum of root nodes in all dehydrated views in this container.
 */
export declare function calcSerializedContainerSize(hydrationInfo: DehydratedView, index: number): number;
/**
 * Attempt to initialize the `disconnectedNodes` field of the given
 * `DehydratedView`. Returns the initialized value.
 */
export declare function initDisconnectedNodes(hydrationInfo: DehydratedView): Set<number> | null;
/**
 * Checks whether a node is annotated as "disconnected", i.e. not present
 * in the DOM at serialization time. We should not attempt hydration for
 * such nodes and instead, use a regular "creation mode".
 */
export declare function isDisconnectedNode(hydrationInfo: DehydratedView, index: number): boolean;
/**
 * Checks whether a node can be hydrated.
 * @param lView View in which the node instance is placed.
 * @param tNode Node to be checked.
 */
export declare function canHydrateNode(lView: LView, tNode: TNode): boolean;
/**
 * Helper function to prepare text nodes for serialization by ensuring
 * that seperate logical text blocks in the DOM remain separate after
 * serialization.
 */
export declare function processTextNodeBeforeSerialization(context: HydrationContext, node: RNode): void;
export declare function convertHydrateTriggersToJsAction(triggers: Map<DeferBlockTrigger, HydrateTriggerDetails | null> | null): string[];
/**
 * Builds a queue of blocks that need to be hydrated, looking up the
 * tree to the topmost defer block that exists in the tree that hasn't
 * been hydrated, but exists in the registry. This queue is in top down
 * hierarchical order as a list of defer block ids.
 * Note: This is utilizing serialized information to navigate up the tree
 */
export declare function getParentBlockHydrationQueue(deferBlockId: string, injector: Injector): {
    parentBlockPromise: Promise<void> | null;
    hydrationQueue: string[];
};
export declare function appendDeferBlocksToJSActionMap(doc: Document, injector: Injector): void;
export declare function retrieveDeferBlockDataImpl(injector: Injector): {
    [key: string]: SerializedDeferBlock;
};
/**
 * Sets the implementation for the `retrieveDeferBlockData` function.
 */
export declare function enableRetrieveDeferBlockDataImpl(): void;
/**
 * Retrieves defer block data from TransferState storage
 */
export declare function retrieveDeferBlockData(injector: Injector): {
    [key: string]: SerializedDeferBlock;
};
/**
 * Processes all of the defer block data in the transfer state and creates a map of the summaries
 */
export declare function processBlockData(injector: Injector): Map<string, BlockSummary>;
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
export declare function verifySsrContentsIntegrity(doc: Document): void;
export {};
