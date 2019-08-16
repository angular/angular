/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from '../../util/assert';
import {assertLView} from '../assert';
import {TNodeType} from '../interfaces/node';
import {isLContainer, isLView} from '../interfaces/type_checks';
import {CONTEXT, DECLARATION_VIEW, FLAGS, LView, LViewFlags, PARENT, RootContext, T_HOST} from '../interfaces/view';

import {readPatchedLView} from './view_utils';



/**
 * Gets the parent LView of the passed LView, if the PARENT is an LContainer, will get the parent of
 * that LContainer, which is an LView
 * @param lView the lView whose parent to get
 */
export function getLViewParent(lView: LView): LView|null {
  ngDevMode && assertLView(lView);
  const parent = lView[PARENT];
  return isLContainer(parent) ? parent[PARENT] ! : parent;
}

/**
 * Retrieve the root view from any component or `LView` by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param componentOrLView any component or `LView`
 */
export function getRootView(componentOrLView: LView | {}): LView {
  ngDevMode && assertDefined(componentOrLView, 'component');
  let lView = isLView(componentOrLView) ? componentOrLView : readPatchedLView(componentOrLView) !;
  while (lView && !(lView[FLAGS] & LViewFlags.IsRoot)) {
    lView = getLViewParent(lView) !;
  }
  ngDevMode && assertLView(lView);
  return lView;
}

/**
 * Given an `LView`, find the closest declaration view which is not an embedded view.
 *
 * This method searches for the `LView` associated with the component which declared the `LView`.
 *
 * This function may return itself if the `LView` passed in is not an embedded `LView`. Otherwise
 * it walks the declaration parents until it finds a component view (non-embedded-view.)
 *
 * @param lView LView for which we want a host element node
 * @returns The host node
 */
export function findComponentView(lView: LView): LView {
  let rootTNode = lView[T_HOST];
  while (rootTNode !== null && rootTNode.type === TNodeType.View) {
    ngDevMode && assertDefined(lView[DECLARATION_VIEW], 'lView[DECLARATION_VIEW]');
    lView = lView[DECLARATION_VIEW] !;
    rootTNode = lView[T_HOST];
  }
  ngDevMode && assertLView(lView);
  return lView;
}

/**
 * Returns the `RootContext` instance that is associated with
 * the application where the target is situated. It does this by walking the parent views until it
 * gets to the root view, then getting the context off of that.
 *
 * @param viewOrComponent the `LView` or component to get the root context for.
 */
export function getRootContext(viewOrComponent: LView | {}): RootContext {
  const rootView = getRootView(viewOrComponent);
  ngDevMode &&
      assertDefined(rootView[CONTEXT], 'RootView has no context. Perhaps it is disconnected?');
  return rootView[CONTEXT] as RootContext;
}
