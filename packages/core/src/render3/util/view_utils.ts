/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDomNode, assertGreaterThan, assertGreaterThanOrEqual, assertIndexInRange, assertLessThan} from '../../util/assert';
import {assertTNode, assertTNodeForLView} from '../assert';
import {LContainer, TYPE} from '../interfaces/container';
import {TConstants, TNode} from '../interfaces/node';
import {isProceduralRenderer} from '../interfaces/renderer';
import {RNode} from '../interfaces/renderer_dom';
import {isLContainer, isLView} from '../interfaces/type_checks';
import {FLAGS, HEADER_OFFSET, HOST, LView, LViewFlags, PARENT, PREORDER_HOOK_FLAGS, RENDERER, TData, TRANSPLANTED_VIEWS_TO_REFRESH, TView} from '../interfaces/view';



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
 * Returns `LContainer` or `null` if not found.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function unwrapLContainer(value: RNode|LView|LContainer): LContainer|null {
  while (Array.isArray(value)) {
    // This check is same as `isLContainer()` but we don't call at as we don't want to call
    // `Array.isArray()` twice and give JITer more work for inlining.
    if (value[TYPE] === true) return value as LContainer;
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
  ngDevMode && !isProceduralRenderer(lView[RENDERER]) && assertDomNode(node);
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
    ngDevMode && node !== null && !isProceduralRenderer(lView[RENDERER]) && assertDomNode(node);
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
  lView[PREORDER_HOOK_FLAGS] = 0;
}

/**
 * Updates the `TRANSPLANTED_VIEWS_TO_REFRESH` counter on the `LContainer` as well as the parents
 * whose
 *  1. counter goes from 0 to 1, indicating that there is a new child that has a view to refresh
 *  or
 *  2. counter goes from 1 to 0, indicating there are no more descendant views to refresh
 */
export function updateTransplantedViewCount(lContainer: LContainer, amount: 1|- 1) {
  lContainer[TRANSPLANTED_VIEWS_TO_REFRESH] += amount;
  let viewOrContainer: LView|LContainer = lContainer;
  let parent: LView|LContainer|null = lContainer[PARENT];
  while (parent !== null &&
         ((amount === 1 && viewOrContainer[TRANSPLANTED_VIEWS_TO_REFRESH] === 1) ||
          (amount === -1 && viewOrContainer[TRANSPLANTED_VIEWS_TO_REFRESH] === 0))) {
    parent[TRANSPLANTED_VIEWS_TO_REFRESH] += amount;
    viewOrContainer = parent;
    parent = parent[PARENT];
  }
}
