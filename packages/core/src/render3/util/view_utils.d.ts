/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LContainer } from '../interfaces/container';
import { TConstants, TNode } from '../interfaces/node';
import { RNode } from '../interfaces/renderer_dom';
import { LView, TData, TView } from '../interfaces/view';
/**
 * For efficiency reasons we often put several different data types (`RNode`, `LView`, `LContainer`)
 * in same location in `LView`. This is because we don't want to pre-allocate space for it
 * because the storage is sparse. This file contains utilities for dealing with such data types.
 *
 * How do we know what is stored at a given location in `LView`.
 * - `Array.isArray(value) === false` => `RNode` (The normal storage value)
 * - `Array.isArray(value) === true` => then the `value[0]` represents the wrapped value.
 *   - `typeof value[TYPE] === 'object'` => `LView`
 *      - This happens when we have a component at a given location
 *   - `typeof value[TYPE] === true` => `LContainer`
 *      - This happens when we have `LContainer` binding at a given location.
 *
 *
 * NOTE: it is assumed that `Array.isArray` and `typeof` operations are very efficient.
 */
/**
 * Returns `RNode`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export declare function unwrapRNode(value: RNode | LView | LContainer): RNode;
/**
 * Returns `LView` or `null` if not found.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export declare function unwrapLView(value: RNode | LView | LContainer): LView | null;
/**
 * Retrieves an element value from the provided `viewData`, by unwrapping
 * from any containers, component views, or style contexts.
 */
export declare function getNativeByIndex(index: number, lView: LView): RNode;
/**
 * Retrieve an `RNode` for a given `TNode` and `LView`.
 *
 * This function guarantees in dev mode to retrieve a non-null `RNode`.
 *
 * @param tNode
 * @param lView
 */
export declare function getNativeByTNode(tNode: TNode, lView: LView): RNode;
/**
 * Retrieve an `RNode` or `null` for a given `TNode` and `LView`.
 *
 * Some `TNode`s don't have associated `RNode`s. For example `Projection`
 *
 * @param tNode
 * @param lView
 */
export declare function getNativeByTNodeOrNull(tNode: TNode | null, lView: LView): RNode | null;
export declare function getTNode(tView: TView, index: number): TNode;
/** Retrieves a value from any `LView` or `TData`. */
export declare function load<T>(view: LView | TData, index: number): T;
/** Store a value in the `data` at a given `index`. */
export declare function store<T>(tView: TView, lView: LView, index: number, value: T): void;
export declare function getComponentLViewByIndex(nodeIndex: number, hostView: LView): LView;
/** Checks whether a given view is in creation mode */
export declare function isCreationMode(view: LView): boolean;
/**
 * Returns a boolean for whether the view is attached to the change detection tree.
 *
 * Note: This determines whether a view should be checked, not whether it's inserted
 * into a container. For that, you'll want `viewAttachedToContainer` below.
 */
export declare function viewAttachedToChangeDetector(view: LView): boolean;
/** Returns a boolean for whether the view is attached to a container. */
export declare function viewAttachedToContainer(view: LView): boolean;
/** Returns a constant from `TConstants` instance. */
export declare function getConstant<T>(consts: TConstants | null, index: null | undefined): null;
export declare function getConstant<T>(consts: TConstants, index: number): T | null;
export declare function getConstant<T>(consts: TConstants | null, index: number | null | undefined): T | null;
/**
 * Resets the pre-order hook flags of the view.
 * @param lView the LView on which the flags are reset
 */
export declare function resetPreOrderHookFlags(lView: LView): void;
/**
 * Adds the `RefreshView` flag from the lView and updates HAS_CHILD_VIEWS_TO_REFRESH flag of
 * parents.
 */
export declare function markViewForRefresh(lView: LView): void;
/**
 * Walks up the LView hierarchy.
 * @param nestingLevel Number of times to walk up in hierarchy.
 * @param currentView View from which to start the lookup.
 */
export declare function walkUpViews(nestingLevel: number, currentView: LView): LView;
export declare function requiresRefreshOrTraversal(lView: LView): boolean;
/**
 * Updates the `HasChildViewsToRefresh` flag on the parents of the `LView` as well as the
 * parents above.
 */
export declare function updateAncestorTraversalFlagsOnAttach(lView: LView): void;
/**
 * Ensures views above the given `lView` are traversed during change detection even when they are
 * not dirty.
 *
 * This is done by setting the `HAS_CHILD_VIEWS_TO_REFRESH` flag up to the root, stopping when the
 * flag is already `true` or the `lView` is detached.
 */
export declare function markAncestorsForTraversal(lView: LView): void;
/**
 * Stores a LView-specific destroy callback.
 */
export declare function storeLViewOnDestroy(lView: LView, onDestroyCallback: () => void): void;
/**
 * Removes previously registered LView-specific destroy callback.
 */
export declare function removeLViewOnDestroy(lView: LView, onDestroyCallback: () => void): void;
/**
 * Gets the parent LView of the passed LView, if the PARENT is an LContainer, will get the parent of
 * that LContainer, which is an LView
 * @param lView the lView whose parent to get
 */
export declare function getLViewParent(lView: LView): LView | null;
export declare function getOrCreateLViewCleanup(view: LView): any[];
export declare function getOrCreateTViewCleanup(tView: TView): any[];
/**
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 */
export declare function storeCleanupWithContext(tView: TView, lView: LView, context: any, cleanupFn: Function): void;
