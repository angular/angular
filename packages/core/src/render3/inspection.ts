/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RElement, RNode} from './interfaces/renderer';
import {BINDING_INDEX, HEADER_OFFSET, LViewData} from './interfaces/view';
import {loadElementInternal} from './util';

export const NG_MONKEYPATCH_KEY = '__ng_data__';

export interface NativeLViewData {
  lViewData: LViewData;
  native: RNode;
  index: number
}

export function linkDomNodeToView(element: RElement | Element, view: LViewData) {
  (element as any)[NG_MONKEYPATCH_KEY] = view;
}

export function getViewFromDomNode(element: RElement | Element): NativeLViewData|null {
  const viewData = (element as any)[NG_MONKEYPATCH_KEY] as LViewData;
  if (viewData) {
    let end = viewData[BINDING_INDEX];
    end = end > 0 ? end : viewData.length;
    for (let i = 0; i < end; i++) {
      const record = loadElementInternal(i, viewData);
      if (record.native == element) {
        // we need to return an object which has the context of the ViewData,
        // element, and the index where the element is
        return {lViewData: viewData, index: i, native: element};
      }
    }
  }
  return null;
}
