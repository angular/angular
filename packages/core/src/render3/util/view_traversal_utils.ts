/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from '../../util/assert';
import {assertLView} from '../assert';
import {readPatchedLView} from '../context_discovery';
import {LContainer} from '../interfaces/container';
import {isLContainer, isLView} from '../interfaces/type_checks';
import {CHILD_HEAD, CONTEXT, FLAGS, LView, LViewFlags, NEXT, PARENT, RootContext} from '../interfaces/view';


/**
 * Gets the parent LView of the passed LView, if the PARENT is an LContainer, will get the parent of
 * that LContainer, which is an LView
 * @param lView the lView whose parent to get
 */
export function getLViewParent(lView: LView): LView|null {
  ngDevMode && assertLView(lView);
  const parent = lView[PARENT];
  return isLContainer(parent) ? parent[PARENT]! : parent;
}

/**
 * Retrieve the root view from any component or `LView` by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param componentOrLView any component or `LView`
 */
export function getRootView(componentOrLView: LView|{}): LView {
  ngDevMode && assertDefined(componentOrLView, 'component');
  let lView = isLView(componentOrLView) ? componentOrLView : readPatchedLView(componentOrLView)!;
  while (lView && !(lView[FLAGS] & LViewFlags.IsRoot)) {
    lView = getLViewParent(lView)!;
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
export function getRootContext(viewOrComponent: LView|{}): RootContext {
  const rootView = getRootView(viewOrComponent);
  ngDevMode &&
      assertDefined(rootView[CONTEXT], 'RootView has no context. Perhaps it is disconnected?');
  return rootView[CONTEXT] as RootContext;
}


/**
 * Gets the first `LContainer` in the LView or `null` if none exists.
 */
export function getFirstLContainer(lView: LView): LContainer|null {
  return getNearestLContainer(lView[CHILD_HEAD]);
}

/**
 * Gets the next `LContainer` that is a sibling of the given container.
 */
export function getNextLContainer(container: LContainer): LContainer|null {
  return getNearestLContainer(container[NEXT]);
}

function getNearestLContainer(viewOrContainer: LContainer|LView|null) {
  while (viewOrContainer !== null && !isLContainer(viewOrContainer)) {
    viewOrContainer = viewOrContainer[NEXT];
  }
  return viewOrContainer;
}
