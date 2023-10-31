/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {TNode} from '../interfaces/node';
import type {Renderer} from '../interfaces/renderer';
import type {RElement} from '../interfaces/renderer_dom';
import {FLAGS, LViewFlags, type LView} from '../interfaces/view';
import {shouldProtectAttribute} from './protected_attributes';

let _setPropertyWithHydrationSupport: typeof _setPropertyWithHydrationSupportImpl = (
  lView: LView | null,
  tNode: TNode | null,
  renderer: Renderer,
  element: RElement,
  propName: string,
  propValue: any,
) => {
  renderer.setProperty(element, propName, propValue);
};

function _setPropertyWithHydrationSupportImpl(
  lView: LView | null,
  tNode: TNode | null,
  renderer: Renderer,
  element: RElement,
  propName: string,
  propValue: any,
) {
  const isFirstPass =
    lView !== null && (lView[FLAGS] & LViewFlags.FirstLViewPass) === LViewFlags.FirstLViewPass;

  // We shouldn't proceed with any checks if the `lView` isn't provided
  // (this happens for the root component) or if we're not in creation mode.
  // Please note that we don't check whether `lView` is provided or whether
  // we're in creation mode within the `shouldProtectAttribute` function because
  // having another function that executes every time a property is set might have
  // affected performance; thus, it's guarded with `isFirstPass`.
  if (
    isFirstPass &&
    shouldProtectAttribute(
      lView,
      // The `tNode` is non-null asserted because `lView` is provided
      // (and therefore `tNode` is also provided).
      tNode!,
      element,
      propValue,
    )
  ) {
    return;
  }

  renderer.setProperty(element, propName, propValue);
}

export function _setPropertyImpl(
  lView: LView | null,
  tNode: TNode | null,
  renderer: Renderer,
  element: RElement,
  propName: string,
  propValue: any,
) {
  _setPropertyWithHydrationSupport(lView, tNode, renderer, element, propName, propValue);
}

export function enableSetPropertyWithHydrationSupportImpl() {
  _setPropertyWithHydrationSupport = _setPropertyWithHydrationSupportImpl;
}
