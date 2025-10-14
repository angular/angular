/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../../errors';
import {
  assertDefined,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  assertIndexInRange,
  assertLessThan,
} from '../../util/assert';
import {assertLView, assertTNode, assertTNodeForLView} from '../assert';
import {TYPE} from '../interfaces/container';
import {isDestroyed, isLContainer, isLView} from '../interfaces/type_checks';
import {
  CLEANUP,
  DECLARATION_VIEW,
  ENVIRONMENT,
  FLAGS,
  HEADER_OFFSET,
  HOST,
  ON_DESTROY_HOOKS,
  PARENT,
  PREORDER_HOOK_FLAGS,
  REACTIVE_TEMPLATE_CONSUMER,
} from '../interfaces/view';
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
export function unwrapRNode(value) {
  while (Array.isArray(value)) {
    value = value[HOST];
  }
  return value;
}
/**
 * Returns `LView` or `null` if not found.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function unwrapLView(value) {
  while (Array.isArray(value)) {
    // This check is same as `isLView()` but we don't call at as we don't want to call
    // `Array.isArray()` twice and give JITer more work for inlining.
    if (typeof value[TYPE] === 'object') return value;
    value = value[HOST];
  }
  return null;
}
/**
 * Retrieves an element value from the provided `viewData`, by unwrapping
 * from any containers, component views, or style contexts.
 */
export function getNativeByIndex(index, lView) {
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
export function getNativeByTNode(tNode, lView) {
  ngDevMode && assertTNodeForLView(tNode, lView);
  ngDevMode && assertIndexInRange(lView, tNode.index);
  const node = unwrapRNode(lView[tNode.index]);
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
export function getNativeByTNodeOrNull(tNode, lView) {
  const index = tNode === null ? -1 : tNode.index;
  if (index !== -1) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    const node = unwrapRNode(lView[index]);
    return node;
  }
  return null;
}
// fixme(misko): The return Type should be `TNode|null`
export function getTNode(tView, index) {
  ngDevMode && assertGreaterThan(index, -1, 'wrong index for TNode');
  ngDevMode && assertLessThan(index, tView.data.length, 'wrong index for TNode');
  const tNode = tView.data[index];
  ngDevMode && tNode !== null && assertTNode(tNode);
  return tNode;
}
/** Retrieves a value from any `LView` or `TData`. */
export function load(view, index) {
  ngDevMode && assertIndexInRange(view, index);
  return view[index];
}
/** Store a value in the `data` at a given `index`. */
export function store(tView, lView, index, value) {
  // We don't store any static data for local variables, so the first time
  // we see the template, we should store as null to avoid a sparse array
  if (index >= tView.data.length) {
    tView.data[index] = null;
    tView.blueprint[index] = null;
  }
  lView[index] = value;
}
export function getComponentLViewByIndex(nodeIndex, hostView) {
  // Could be an LView or an LContainer. If LContainer, unwrap to find LView.
  ngDevMode && assertIndexInRange(hostView, nodeIndex);
  const slotValue = hostView[nodeIndex];
  const lView = isLView(slotValue) ? slotValue : slotValue[HOST];
  return lView;
}
/** Checks whether a given view is in creation mode */
export function isCreationMode(view) {
  return (view[FLAGS] & 4) /* LViewFlags.CreationMode */ === 4 /* LViewFlags.CreationMode */;
}
/**
 * Returns a boolean for whether the view is attached to the change detection tree.
 *
 * Note: This determines whether a view should be checked, not whether it's inserted
 * into a container. For that, you'll want `viewAttachedToContainer` below.
 */
export function viewAttachedToChangeDetector(view) {
  return (view[FLAGS] & 128) /* LViewFlags.Attached */ === 128 /* LViewFlags.Attached */;
}
/** Returns a boolean for whether the view is attached to a container. */
export function viewAttachedToContainer(view) {
  return isLContainer(view[PARENT]);
}
export function getConstant(consts, index) {
  if (index === null || index === undefined) return null;
  ngDevMode && assertIndexInRange(consts, index);
  return consts[index];
}
/**
 * Resets the pre-order hook flags of the view.
 * @param lView the LView on which the flags are reset
 */
export function resetPreOrderHookFlags(lView) {
  lView[PREORDER_HOOK_FLAGS] = 0;
}
/**
 * Adds the `RefreshView` flag from the lView and updates HAS_CHILD_VIEWS_TO_REFRESH flag of
 * parents.
 */
export function markViewForRefresh(lView) {
  if (lView[FLAGS] & 1024 /* LViewFlags.RefreshView */) {
    return;
  }
  lView[FLAGS] |= 1024 /* LViewFlags.RefreshView */;
  if (viewAttachedToChangeDetector(lView)) {
    markAncestorsForTraversal(lView);
  }
}
/**
 * Walks up the LView hierarchy.
 * @param nestingLevel Number of times to walk up in hierarchy.
 * @param currentView View from which to start the lookup.
 */
export function walkUpViews(nestingLevel, currentView) {
  while (nestingLevel > 0) {
    ngDevMode &&
      assertDefined(
        currentView[DECLARATION_VIEW],
        'Declaration view should be defined if nesting level is greater than 0.',
      );
    currentView = currentView[DECLARATION_VIEW];
    nestingLevel--;
  }
  return currentView;
}
export function requiresRefreshOrTraversal(lView) {
  return !!(
    lView[FLAGS] &
      (1024 /* LViewFlags.RefreshView */ | 8192) /* LViewFlags.HasChildViewsToRefresh */ ||
    lView[REACTIVE_TEMPLATE_CONSUMER]?.dirty
  );
}
/**
 * Updates the `HasChildViewsToRefresh` flag on the parents of the `LView` as well as the
 * parents above.
 */
export function updateAncestorTraversalFlagsOnAttach(lView) {
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(8 /* NotificationSource.ViewAttached */);
  if (lView[FLAGS] & 64 /* LViewFlags.Dirty */) {
    lView[FLAGS] |= 1024 /* LViewFlags.RefreshView */;
  }
  if (requiresRefreshOrTraversal(lView)) {
    markAncestorsForTraversal(lView);
  }
}
/**
 * Ensures views above the given `lView` are traversed during change detection even when they are
 * not dirty.
 *
 * This is done by setting the `HAS_CHILD_VIEWS_TO_REFRESH` flag up to the root, stopping when the
 * flag is already `true` or the `lView` is detached.
 */
export function markAncestorsForTraversal(lView) {
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(
    0 /* NotificationSource.MarkAncestorsForTraversal */,
  );
  let parent = getLViewParent(lView);
  while (parent !== null) {
    // We stop adding markers to the ancestors once we reach one that already has the marker. This
    // is to avoid needlessly traversing all the way to the root when the marker already exists.
    if (parent[FLAGS] & 8192 /* LViewFlags.HasChildViewsToRefresh */) {
      break;
    }
    parent[FLAGS] |= 8192 /* LViewFlags.HasChildViewsToRefresh */;
    if (!viewAttachedToChangeDetector(parent)) {
      break;
    }
    parent = getLViewParent(parent);
  }
}
/**
 * Stores a LView-specific destroy callback.
 */
export function storeLViewOnDestroy(lView, onDestroyCallback) {
  if (isDestroyed(lView)) {
    throw new RuntimeError(
      911 /* RuntimeErrorCode.VIEW_ALREADY_DESTROYED */,
      ngDevMode && 'View has already been destroyed.',
    );
  }
  if (lView[ON_DESTROY_HOOKS] === null) {
    lView[ON_DESTROY_HOOKS] = [];
  }
  lView[ON_DESTROY_HOOKS].push(onDestroyCallback);
}
/**
 * Removes previously registered LView-specific destroy callback.
 */
export function removeLViewOnDestroy(lView, onDestroyCallback) {
  if (lView[ON_DESTROY_HOOKS] === null) return;
  const destroyCBIdx = lView[ON_DESTROY_HOOKS].indexOf(onDestroyCallback);
  if (destroyCBIdx !== -1) {
    lView[ON_DESTROY_HOOKS].splice(destroyCBIdx, 1);
  }
}
/**
 * Gets the parent LView of the passed LView, if the PARENT is an LContainer, will get the parent of
 * that LContainer, which is an LView
 * @param lView the lView whose parent to get
 */
export function getLViewParent(lView) {
  ngDevMode && assertLView(lView);
  const parent = lView[PARENT];
  return isLContainer(parent) ? parent[PARENT] : parent;
}
export function getOrCreateLViewCleanup(view) {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return (view[CLEANUP] ??= []);
}
export function getOrCreateTViewCleanup(tView) {
  return (tView.cleanup ??= []);
}
/**
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 */
export function storeCleanupWithContext(tView, lView, context, cleanupFn) {
  const lCleanup = getOrCreateLViewCleanup(lView);
  // Historically the `storeCleanupWithContext` was used to register both framework-level and
  // user-defined cleanup callbacks, but over time those two types of cleanups were separated.
  // This dev mode checks assures that user-level cleanup callbacks are _not_ stored in data
  // structures reserved for framework-specific hooks.
  ngDevMode &&
    assertDefined(
      context,
      'Cleanup context is mandatory when registering framework-level destroy hooks',
    );
  lCleanup.push(context);
  if (tView.firstCreatePass) {
    getOrCreateTViewCleanup(tView).push(cleanupFn, lCleanup.length - 1);
  } else {
    // Make sure that no new framework-level cleanup functions are registered after the first
    // template pass is done (and TView data structures are meant to fully constructed).
    if (ngDevMode) {
      Object.freeze(getOrCreateTViewCleanup(tView));
    }
  }
}
//# sourceMappingURL=view_utils.js.map
