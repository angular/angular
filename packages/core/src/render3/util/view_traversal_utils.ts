/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from '../../util/assert';
import {NG_DEV_MODE} from '../../util/ng_dev_mode';
import {assertLView} from '../assert';
import {isLContainer, isLView} from '../interfaces/type_checks';
import {CONTEXT, FLAGS, LView, LViewFlags, PARENT, RootContext} from '../interfaces/view';
import {readPatchedLView} from './view_utils';


/**
 * Gets the parent LView of the passed LView, if the PARENT is an LContainer, will get the parent of
 * that LContainer, which is an LView
 * @param lView the lView whose parent to get
 */
export function getLViewParent(lView: LView): LView|null {
  NG_DEV_MODE && assertLView(lView);
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
  NG_DEV_MODE && assertDefined(componentOrLView, 'component');
  let lView = isLView(componentOrLView) ? componentOrLView : readPatchedLView(componentOrLView) !;
  while (lView && !(lView[FLAGS] & LViewFlags.IsRoot)) {
    lView = getLViewParent(lView) !;
  }
  NG_DEV_MODE && assertLView(lView);
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
  NG_DEV_MODE &&
      assertDefined(rootView[CONTEXT], 'RootView has no context. Perhaps it is disconnected?');
  return rootView[CONTEXT] as RootContext;
}
