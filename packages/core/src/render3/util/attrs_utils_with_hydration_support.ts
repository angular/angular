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

let _setAttributeWithHydrationSupport: typeof _setAttributeWithHydrationSupportImpl = (
  isFirstPass: boolean,
  renderer: Renderer,
  nodeIndex: number,
  element: RElement,
  attributeName: string,
  attributeValue: string,
  namespace: string | null | undefined,
  hydrationInfo: DehydratedView | null,
) => {
  renderer.setAttribute(element, attributeName, attributeValue, namespace);
};

function _setAttributeWithHydrationSupportImpl(
  isFirstPass: boolean,
  renderer: Renderer,
  nodeIndex: number,
  element: RElement,
  attributeName: string,
  attributeValue: string,
  namespace: string | null | undefined,
  hydrationInfo: DehydratedView | null,
) {
  if (isFirstPass && shouldProtectAttribute(element, nodeIndex, attributeValue, hydrationInfo)) {
    return;
  }

  renderer.setAttribute(element, attributeName, attributeValue, namespace);
}

export function _setAttributeImpl(
  isFirstPass: boolean,
  renderer: Renderer,
  nodeIndex: number,
  element: RElement,
  attributeName: string,
  attributeValue: string,
  namespace: string | null | undefined,
  hydrationInfo: DehydratedView | null,
) {
  _setAttributeWithHydrationSupport(
    isFirstPass,
    renderer,
    nodeIndex,
    element,
    attributeName,
    attributeValue,
    namespace,
    hydrationInfo,
  );
}

export function enableSetAttributeWithHydrationSupportImpl() {
  _setAttributeWithHydrationSupport = _setAttributeWithHydrationSupportImpl;
}
