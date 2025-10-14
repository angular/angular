/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di';
import { TNode } from '../render3/interfaces/node';
import { LView, TView } from '../render3/interfaces/view';
import type { HydrationContext } from './annotate';
export declare function setIsI18nHydrationSupportEnabled(enabled: boolean): void;
export declare function isI18nHydrationSupportEnabled(): boolean;
/**
 * Prepares an i18n block and its children, located at the given
 * view and instruction index, for hydration.
 *
 * @param lView lView with the i18n block
 * @param index index of the i18n block in the lView
 * @param parentTNode TNode of the parent of the i18n block
 * @param subTemplateIndex sub-template index, or -1 for the main template
 */
export declare function prepareI18nBlockForHydration(lView: LView, index: number, parentTNode: TNode | null, subTemplateIndex: number): void;
export declare function enablePrepareI18nBlockForHydrationImpl(): void;
export declare function isI18nHydrationEnabled(injector?: Injector): boolean;
/**
 * Collects, if not already cached, all of the indices in the
 * given TView which are children of an i18n block.
 *
 * Since i18n blocks don't introduce a parent TNode, this is necessary
 * in order to determine which indices in a LView are translated.
 */
export declare function getOrComputeI18nChildren(tView: TView, context: HydrationContext): Set<number> | null;
/**
 * Resulting data from serializing an i18n block.
 */
export interface SerializedI18nBlock {
    /**
     * A queue of active ICU cases from a depth-first traversal
     * of the i18n AST. This is serialized to the client in order
     * to correctly associate DOM nodes with i18n nodes during
     * hydration.
     */
    caseQueue: Array<number>;
    /**
     * A set of indices in the lView of the block for nodes
     * that are disconnected from the DOM. In i18n, this can
     * happen when using content projection but some nodes are
     * not selected by an <ng-content />.
     */
    disconnectedNodes: Set<number>;
    /**
     * A set of indices in the lView of the block for nodes
     * considered "disjoint", indicating that we need to serialize
     * a path to the node in order to hydrate it.
     *
     * A node is considered disjoint when its RNode does not
     * directly follow the RNode of the previous i18n node, for
     * example, because of content projection.
     */
    disjointNodes: Set<number>;
}
/**
 * Attempts to serialize i18n data for an i18n block, located at
 * the given view and instruction index.
 *
 * @param lView lView with the i18n block
 * @param index index of the i18n block in the lView
 * @param context the hydration context
 * @returns the i18n data, or null if there is no relevant data
 */
export declare function trySerializeI18nBlock(lView: LView, index: number, context: HydrationContext): SerializedI18nBlock | null;
/**
 * Mark the case for the ICU node at the given index in the view as claimed,
 * allowing its nodes to be hydrated and not cleaned up.
 */
export declare function claimDehydratedIcuCase(lView: LView, icuIndex: number, caseIndex: number): void;
export declare function enableClaimDehydratedIcuCaseImpl(): void;
/**
 * Clean up all i18n hydration data associated with the given view.
 */
export declare function cleanupI18nHydrationData(lView: LView): void;
