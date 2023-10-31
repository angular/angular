/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DehydratedView} from '../../hydration/interfaces';
import {Renderer} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';
import {shouldProtectAttribute} from './protected_attributes';

let _setPropertyWithHydrationSupport: typeof _setPropertyWithHydrationSupportImpl = (
  isFirstPass: boolean,
  renderer: Renderer,
  nodeIndex: number,
  element: RElement,
  propName: string,
  propValue: any,
  hydrationInfo: DehydratedView | null,
) => {
  renderer.setProperty(element, propName, propValue);
};

function _setPropertyWithHydrationSupportImpl(
  isFirstPass: boolean,
  renderer: Renderer,
  nodeIndex: number,
  element: RElement,
  propName: string,
  propValue: any,
  hydrationInfo: DehydratedView | null,
) {
  if (isFirstPass && shouldProtectAttribute(element, nodeIndex, propValue, hydrationInfo)) {
    return;
  }

  renderer.setProperty(element, propName, propValue);
}

export function _setPropertyImpl(
  isFirstPass: boolean,
  renderer: Renderer,
  nodeIndex: number,
  element: RElement,
  propName: string,
  propValue: any,
  hydrationInfo: DehydratedView | null,
) {
  _setPropertyWithHydrationSupport(
    isFirstPass,
    renderer,
    nodeIndex,
    element,
    propName,
    propValue,
    hydrationInfo,
  );
}

export function enableSetPropertyWithHydrationSupportImpl() {
  _setPropertyWithHydrationSupport = _setPropertyWithHydrationSupportImpl;
}
