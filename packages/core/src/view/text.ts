/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {asTextData, BindingDef, BindingFlags, NodeDef, NodeFlags, TextData, ViewData} from './types';
import {checkAndUpdateBinding, getParentRenderElement} from './util';

export function textDef(
    checkIndex: number, ngContentIndex: number|null, staticText: string[]): NodeDef {
  const bindings: BindingDef[] = [];
  for (let i = 1; i < staticText.length; i++) {
    bindings[i - 1] = {
      flags: BindingFlags.TypeProperty,
      name: null,
      ns: null,
      nonMinifiedName: null,
      securityContext: null,
      suffix: staticText[i],
    };
  }

  return {
    // will bet set by the view definition
    nodeIndex: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    checkIndex,
    flags: NodeFlags.TypeText,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0,
    matchedQueries: {},
    matchedQueryIds: 0,
    references: {},
    ngContentIndex,
    childCount: 0,
    bindings,
    bindingFlags: BindingFlags.TypeProperty,
    outputs: [],
    element: null,
    provider: null,
    text: {prefix: staticText[0]},
    query: null,
    ngContent: null,
  };
}

export function createText(view: ViewData, renderHost: any, def: NodeDef): TextData {
  let renderNode: any;
  const renderer = view.renderer;
  renderNode = renderer.createText(def.text!.prefix);
  const parentEl = getParentRenderElement(view, renderHost, def);
  if (parentEl) {
    renderer.appendChild(parentEl, renderNode);
  }
  return {renderText: renderNode};
}

export function checkAndUpdateTextInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any): boolean {
  let changed = false;
  const bindings = def.bindings;
  const bindLen = bindings.length;
  if (bindLen > 0 && checkAndUpdateBinding(view, def, 0, v0)) changed = true;
  if (bindLen > 1 && checkAndUpdateBinding(view, def, 1, v1)) changed = true;
  if (bindLen > 2 && checkAndUpdateBinding(view, def, 2, v2)) changed = true;
  if (bindLen > 3 && checkAndUpdateBinding(view, def, 3, v3)) changed = true;
  if (bindLen > 4 && checkAndUpdateBinding(view, def, 4, v4)) changed = true;
  if (bindLen > 5 && checkAndUpdateBinding(view, def, 5, v5)) changed = true;
  if (bindLen > 6 && checkAndUpdateBinding(view, def, 6, v6)) changed = true;
  if (bindLen > 7 && checkAndUpdateBinding(view, def, 7, v7)) changed = true;
  if (bindLen > 8 && checkAndUpdateBinding(view, def, 8, v8)) changed = true;
  if (bindLen > 9 && checkAndUpdateBinding(view, def, 9, v9)) changed = true;

  if (changed) {
    let value = def.text!.prefix;
    if (bindLen > 0) value += _addInterpolationPart(v0, bindings[0]);
    if (bindLen > 1) value += _addInterpolationPart(v1, bindings[1]);
    if (bindLen > 2) value += _addInterpolationPart(v2, bindings[2]);
    if (bindLen > 3) value += _addInterpolationPart(v3, bindings[3]);
    if (bindLen > 4) value += _addInterpolationPart(v4, bindings[4]);
    if (bindLen > 5) value += _addInterpolationPart(v5, bindings[5]);
    if (bindLen > 6) value += _addInterpolationPart(v6, bindings[6]);
    if (bindLen > 7) value += _addInterpolationPart(v7, bindings[7]);
    if (bindLen > 8) value += _addInterpolationPart(v8, bindings[8]);
    if (bindLen > 9) value += _addInterpolationPart(v9, bindings[9]);
    const renderNode = asTextData(view, def.nodeIndex).renderText;
    view.renderer.setValue(renderNode, value);
  }
  return changed;
}

export function checkAndUpdateTextDynamic(view: ViewData, def: NodeDef, values: any[]): boolean {
  const bindings = def.bindings;
  let changed = false;
  for (let i = 0; i < values.length; i++) {
    // Note: We need to loop over all values, so that
    // the old values are updates as well!
    if (checkAndUpdateBinding(view, def, i, values[i])) {
      changed = true;
    }
  }
  if (changed) {
    let value = '';
    for (let i = 0; i < values.length; i++) {
      value = value + _addInterpolationPart(values[i], bindings[i]);
    }
    value = def.text!.prefix + value;
    const renderNode = asTextData(view, def.nodeIndex).renderText;
    view.renderer.setValue(renderNode, value);
  }
  return changed;
}

function _addInterpolationPart(value: any, binding: BindingDef): string {
  const valueStr = value != null ? value.toString() : '';
  return valueStr + binding.suffix;
}
