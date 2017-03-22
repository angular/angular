/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NodeDef, NodeFlags, ViewData} from './types';
import {RenderNodeAction, getParentRenderElement, visitProjectedRenderNodes} from './util';

export function ngContentDef(ngContentIndex: number, index: number): NodeDef {
  return {
    // will bet set by the view definition
    index: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    flags: NodeFlags.TypeNgContent,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0,
    matchedQueries: {},
    matchedQueryIds: 0,
    references: {}, ngContentIndex,
    childCount: 0,
    bindings: [],
    bindingFlags: 0,
    outputs: [],
    element: null,
    provider: null,
    text: null,
    query: null,
    ngContent: {index}
  };
}

export function appendNgContent(view: ViewData, renderHost: any, def: NodeDef) {
  const parentEl = getParentRenderElement(view, renderHost, def);
  if (!parentEl) {
    // Nothing to do if there is no parent element.
    return;
  }
  const ngContentIndex = def.ngContent !.index;
  visitProjectedRenderNodes(
      view, ngContentIndex, RenderNodeAction.AppendChild, parentEl, null, undefined);
}
