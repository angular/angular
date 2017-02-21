/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NodeDef, NodeType, ViewData, asElementData} from './types';
import {RenderNodeAction, getParentRenderElement, visitProjectedRenderNodes} from './util';

export function ngContentDef(ngContentIndex: number, index: number): NodeDef {
  return {
    type: NodeType.NgContent,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    renderParent: undefined,
    bindingIndex: undefined,
    outputIndex: undefined,
    // regular values
    flags: 0,
    childFlags: 0,
    childMatchedQueries: 0,
    matchedQueries: {},
    matchedQueryIds: 0,
    references: {}, ngContentIndex,
    childCount: 0,
    bindings: [],
    outputs: [],
    element: undefined,
    provider: undefined,
    text: undefined,
    pureExpression: undefined,
    query: undefined,
    ngContent: {index}
  };
}

export function appendNgContent(view: ViewData, renderHost: any, def: NodeDef) {
  const parentEl = getParentRenderElement(view, renderHost, def);
  if (!parentEl) {
    // Nothing to do if there is no parent element.
    return;
  }
  const ngContentIndex = def.ngContent.index;
  visitProjectedRenderNodes(
      view, ngContentIndex, RenderNodeAction.AppendChild, parentEl, undefined, undefined);
}
