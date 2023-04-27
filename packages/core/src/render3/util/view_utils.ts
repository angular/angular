/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {assertGreaterThan, assertGreaterThanOrEqual, assertIndexInRange, assertLessThan} from '../../util/assert';
import {assertTNode, assertTNodeForLView} from '../assert';
import {LContainer, TYPE} from '../interfaces/container';
import {TConstants, TNode} from '../interfaces/node';
import {RNode} from '../interfaces/renderer_dom';
import {isLContainer, isLView} from '../interfaces/type_checks';
import {DESCENDANT_VIEWS_TO_REFRESH, FLAGS, HEADER_OFFSET, HOST, LView, LViewFlags, ON_DESTROY_HOOKS, PARENT, PREORDER_HOOK_FLAGS, PreOrderHookFlags, TData, TView} from '../interfaces/view';



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
export function unwrapRNode(value: RNode|LView|LContainer): RNode {
  while (Array.isArray(value)) {
    value = value[HOST] as any;
  }
  return value as RNode;
}

/**
 * Returns `LView` or `null` if not found.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function unwrapLView(value: RNode|LView|LContainer): LView|null {
  while (Array.isArray(value)) {
    // This check is same as `isLView()` but we don't call at as we don't want to call
    // `Array.isArray()` twice and give JITer more work for inlining.
    if (typeof value[TYPE] === 'object') return value as LView;
    value = value[HOST] as any;
  }
  return null;
}

/**
 * Retrieves an element value from the provided `viewData`, by unwrapping
 * from any containers, component views, or style contexts.
 */
export function getNativeByIndex(index: number, lView: LView): RNode {
  ngDevMode && assertIndexInRange(lView, index);
  ngDevMode && assertGreaterThanOrEqual(index, HEADER_OFFSET, 'Expected to be past HEADER_OFFSET');
  return unwrapRNode(lView[index]);
}

/**
 * Retrieve an `RNode` for a given `TNode` and `LView`.
 *
 * This function guarantees in dev mode to retrieve a non-null `RNode`.
 *
 * @param tNode
 * @param lView
 */
export function getNativeByTNode(tNode: TNode, lView: LView): RNode {
  ngDevMode && assertTNodeForLView(tNode, lView);
  ngDevMode && assertIndexInRange(lView, tNode.index);
  const node: RNode = unwrapRNode(lView[tNode.index]);
  return node;
}

/**
 * Retrieve an `RNode` or `null` for a given `TNode` and `LView`.
 *
 * Some `TNode`s don't have associated `RNode`s. For example `Projection`
 *
 * @param tNode
 * @param lView
 */
export function getNativeByTNodeOrNull(tNode: TNode|null, lView: LView): RNode|null {
  const index = tNode === null ? -1 : tNode.index;
  if (index !== -1) {
    ngDevMode && assertTNodeForLView(tNode!, lView);
    const node: RNode|null = unwrapRNode(lView[index]);
    return node;
  }
  return null;
}


// fixme(misko): The return Type should be `TNode|null`
export function getTNode(tView: TView, index: number): TNode {
  ngDevMode && assertGreaterThan(index, -1, 'wrong index for TNode');
  ngDevMode && assertLessThan(index, tView.data.length, 'wrong index for TNode');
  const tNode = tView.data[index] as TNode;
  ngDevMode && tNode !== null && assertTNode(tNode);
  return tNode;
}

/** Retrieves a value from any `LView` or `TData`. */
export function load<T>(view: LView|TData, index: number): T {
  ngDevMode && assertIndexInRange(view, index);
  return view[index];
}

export function getComponentLViewByIndex(nodeIndex: number, hostView: LView): LView {
  // Could be an LView or an LContainer. If LContainer, unwrap to find LView.
  ngDevMode && assertIndexInRange(hostView, nodeIndex);
  const slotValue = hostView[nodeIndex];
  const lView = isLView(slotValue) ? slotValue : slotValue[HOST];
  return lView;
}

/** Checks whether a given view is in creation mode */
export function isCreationMode(view: LView): boolean {
  return (view[FLAGS] & LViewFlags.CreationMode) === LViewFlags.CreationMode;
}

/**
 * Returns a boolean for whether the view is attached to the change detection tree.
 *
 * Note: This determines whether a view should be checked, not whether it's inserted
 * into a container. For that, you'll want `viewAttachedToContainer` below.
 */
export function viewAttachedToChangeDetector(view: LView): boolean {
  return (view[FLAGS] & LViewFlags.Attached) === LViewFlags.Attached;
}

/** Returns a boolean for whether the view is attached to a container. */
export function viewAttachedToContainer(view: LView): boolean {
  return isLContainer(view[PARENT]);
}

/** Returns a constant from `TConstants` instance. */
export function getConstant<T>(consts: TConstants|null, index: null|undefined): null;
export function getConstant<T>(consts: TConstants, index: number): T|null;
export function getConstant<T>(consts: TConstants|null, index: number|null|undefined): T|null;
export function getConstant<T>(consts: TConstants|null, index: number|null|undefined): T|null {
  if (index === null || index === undefined) return null;
  ngDevMode && assertIndexInRange(consts!, index);
  return consts![index] as unknown as T;
}

/**
 * Resets the pre-order hook flags of the view.
 * @param lView the LView on which the flags are reset
 */
export function resetPreOrderHookFlags(lView: LView) {
  lView[PREORDER_HOOK_FLAGS] = 0 as PreOrderHookFlags;
}

/**
 * Adds the `RefreshView` flag from the lView and updates DESCENDANT_VIEWS_TO_REFRESH counters of
 * parents.
 */
export function markViewForRefresh(lView: LView) {
  if ((lView[FLAGS] & LViewFlags.RefreshView) === 0) {
    lView[FLAGS] |= LViewFlags.RefreshView;
    if (viewAttachedToChangeDetector(lView) && lView[DESCENDANT_VIEWS_TO_REFRESH] === 0) {
      updateViewsToRefreshInAncestors(lView, 1);
    }
  }
}

/**
 * Removes the `RefreshView` flag from the lView and updates DESCENDANT_VIEWS_TO_REFRESH counters of
 * parents.
 */
export function clearViewRefreshFlag(lView: LView) {
  if (lView[FLAGS] & LViewFlags.RefreshView) {
    lView[FLAGS] &= ~LViewFlags.RefreshView;
    if (viewAttachedToChangeDetector(lView) && lView[DESCENDANT_VIEWS_TO_REFRESH] === 0) {
      updateViewsToRefreshInAncestors(lView, -1);
    }
  }
}

/**
 * If the view was previously attached and marked for refresh or has a descendant needing refresh,
 * updates DESCENDANT_VIEWS_TO_REFRESH counters of parent LViews and LContainers.
 */
export function updateViewRefreshCountersBeforeDetach(lView: LView) {
  if (viewAttachedToChangeDetector(lView) &&
      (lView[FLAGS] & LViewFlags.RefreshView || lView[DESCENDANT_VIEWS_TO_REFRESH] > 0)) {
    updateViewsToRefreshInAncestors(lView, -1);
  }
}

/**
 * If the view was previously detached and marked for refresh or has a descendants that needs
 * refresh, updates DESCENDANT_VIEWS_TO_REFRESH counters of parent LViews and LContainers.
 */
export function updateViewRefreshCountersBeforeAttach(lView: LView) {
  if (!viewAttachedToChangeDetector(lView) &&
      (lView[FLAGS] & LViewFlags.RefreshView || lView[DESCENDANT_VIEWS_TO_REFRESH] > 0)) {
    updateViewsToRefreshInAncestors(lView, 1);
  }
}

/**
 * Updates the `DESCENDANT_VIEWS_TO_REFRESH` counter on the parents of the `LView` as well as the
 * parents above that whose
 *  1. counter goes from 0 to 1, indicating that there is a new child that has a view to refresh
 *  or
 *  2. counter goes from 1 to 0, indicating there are no more descendant views to refresh
 */
function updateViewsToRefreshInAncestors(lView: LView, amount: 1|- 1) {
  let parent: LView|LContainer|null = lView[PARENT];
  if (parent === null) {
    return;
  }
  parent[DESCENDANT_VIEWS_TO_REFRESH] += amount;
  ngDevMode &&
      assertGreaterThanOrEqual(
          parent[DESCENDANT_VIEWS_TO_REFRESH], 0,
          'Attempted to clear view refresh indicator in parent but parent was not dirty.');

  let viewOrContainer: LView|LContainer = parent;
  parent = viewOrContainer[PARENT];
  function affectsParentCounter() {
    // Don't increment parent counters if the current view has the `RefreshView` flag. This means
    // that the view should already be accounted for in the parent. Incrementing the parent counter
    // again will result in this view being counted twice.
    const hasRefreshViewFlag =
        !isLContainer(viewOrContainer) && (viewOrContainer[FLAGS] & LViewFlags.RefreshView);
    if (hasRefreshViewFlag) {
      return false;
    }

    const isAttached =
        isLContainer(viewOrContainer) || viewAttachedToChangeDetector(viewOrContainer)
    // Stop counting when we hit a detached view. Detached views are a change detection
    // 'boundary' and do not affect ancestors. That is, when traversing change detection, we do
    // not traverse to a detached view so we should not be updating counters of ancestors above
    // a detached view.
    if (!isAttached) {
      return false;
    }
    const shouldIncrementParentCount =
        amount === 1 && viewOrContainer[DESCENDANT_VIEWS_TO_REFRESH] === 1;
    const shouldDecrementParentCount =
        amount === -1 && viewOrContainer[DESCENDANT_VIEWS_TO_REFRESH] === 0;
    return shouldDecrementParentCount || shouldIncrementParentCount;
  }

  while (parent !== null && affectsParentCounter()) {
    parent[DESCENDANT_VIEWS_TO_REFRESH] += amount;
    ngDevMode &&
        assertGreaterThanOrEqual(
            parent[DESCENDANT_VIEWS_TO_REFRESH], 0,
            'Attempted to clear view refresh indicator in parent but parent was not dirty.');
    viewOrContainer = parent;
    parent = viewOrContainer[PARENT];
  }
}

/**
 * Stores a LView-specific destroy callback.
 */
export function storeLViewOnDestroy(lView: LView, onDestroyCallback: () => void) {
  if ((lView[FLAGS] & LViewFlags.Destroyed) === LViewFlags.Destroyed) {
    throw new RuntimeError(
        RuntimeErrorCode.VIEW_ALREADY_DESTROYED, ngDevMode && 'View has already been destroyed.');
  }
  if (lView[ON_DESTROY_HOOKS] === null) {
    lView[ON_DESTROY_HOOKS] = [];
  }
  lView[ON_DESTROY_HOOKS].push(onDestroyCallback);
}

/**
 * Removes previously registered LView-specific destroy callback.
 */
export function removeLViewOnDestroy(lView: LView, onDestroyCallback: () => void) {
  if (lView[ON_DESTROY_HOOKS] === null) return;

  const destroyCBIdx = lView[ON_DESTROY_HOOKS].indexOf(onDestroyCallback);
  if (destroyCBIdx !== -1) {
    lView[ON_DESTROY_HOOKS].splice(destroyCBIdx, 1);
  }
}
