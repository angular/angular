/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NodeData, NodeDef, NodeFlags, NodeType, ViewData, ViewDefinition} from './types';

export function anchorDef(
    flags: NodeFlags, childCount: number, template?: ViewDefinition): NodeDef {
  return {
    type: NodeType.Anchor,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    childFlags: undefined,
    bindingIndex: undefined,
    providerIndices: undefined,
    // regular values
    flags,
    childCount,
    bindings: [],
    element: undefined,
    provider: undefined,
    text: undefined,
    component: undefined, template
  };
}

export function createAnchor(view: ViewData, renderHost: any, def: NodeDef): NodeData {
  const parentNode = def.parent != null ? view.nodes[def.parent].renderNode : renderHost;
  let renderNode: any;
  if (view.renderer) {
    renderNode = view.renderer.createTemplateAnchor(parentNode);
  } else {
    renderNode = document.createComment('');
    if (parentNode) {
      parentNode.appendChild(renderNode);
    }
  }
  return {
    renderNode,
    provider: undefined,
    embeddedViews: (def.flags & NodeFlags.HasEmbeddedViews) ? [] : undefined,
    componentView: undefined
  };
}
