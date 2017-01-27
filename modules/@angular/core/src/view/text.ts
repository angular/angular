/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {looseIdentical} from '../facade/lang';

import {BindingDef, BindingType, DebugContext, NodeData, NodeDef, NodeFlags, NodeType, Services, TextData, ViewData, ViewFlags, asElementData, asTextData} from './types';
import {checkAndUpdateBinding, sliceErrorStack} from './util';

export function textDef(constants: string[]): NodeDef {
  // skip the call to sliceErrorStack itself + the call to this function.
  const source = isDevMode() ? sliceErrorStack(2, 3) : '';
  const bindings: BindingDef[] = new Array(constants.length - 1);
  for (let i = 1; i < constants.length; i++) {
    bindings[i - 1] = {
      type: BindingType.Interpolation,
      name: undefined,
      nonMinifiedName: undefined,
      securityContext: undefined,
      suffix: constants[i]
    };
  }
  return {
    type: NodeType.Text,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    childFlags: undefined,
    childMatchedQueries: undefined,
    bindingIndex: undefined,
    disposableIndex: undefined,
    // regular values
    flags: 0,
    matchedQueries: {},
    childCount: 0, bindings,
    disposableCount: 0,
    element: undefined,
    provider: undefined,
    text: {prefix: constants[0], source},
    pureExpression: undefined,
    query: undefined,
  };
}

export function createText(view: ViewData, renderHost: any, def: NodeDef): TextData {
  const parentNode =
      def.parent != null ? asElementData(view, def.parent).renderElement : renderHost;
  let renderNode: any;
  if (view.renderer) {
    const debugContext =
        isDevMode() ? view.services.createDebugContext(view, def.index) : undefined;
    renderNode = view.renderer.createText(parentNode, def.text.prefix, debugContext);
  } else {
    renderNode = document.createTextNode(def.text.prefix);
    if (parentNode) {
      parentNode.appendChild(renderNode);
    }
  }
  return {renderText: renderNode};
}

export function checkAndUpdateTextInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any) {
  const bindings = def.bindings;
  let changed = false;
  // Note: fallthrough is intended!
  switch (bindings.length) {
    case 10:
      if (checkAndUpdateBinding(view, def, 9, v9)) changed = true;
    case 9:
      if (checkAndUpdateBinding(view, def, 8, v8)) changed = true;
    case 8:
      if (checkAndUpdateBinding(view, def, 7, v7)) changed = true;
    case 7:
      if (checkAndUpdateBinding(view, def, 6, v6)) changed = true;
    case 6:
      if (checkAndUpdateBinding(view, def, 5, v5)) changed = true;
    case 5:
      if (checkAndUpdateBinding(view, def, 4, v4)) changed = true;
    case 4:
      if (checkAndUpdateBinding(view, def, 3, v3)) changed = true;
    case 3:
      if (checkAndUpdateBinding(view, def, 2, v2)) changed = true;
    case 2:
      if (checkAndUpdateBinding(view, def, 1, v1)) changed = true;
    case 1:
      if (checkAndUpdateBinding(view, def, 0, v0)) changed = true;
  }

  if (changed) {
    let value = '';
    // Note: fallthrough is intended!
    switch (bindings.length) {
      case 10:
        value = _addInterpolationPart(v9, bindings[9]);
      case 9:
        value = _addInterpolationPart(v8, bindings[8]) + value;
      case 8:
        value = _addInterpolationPart(v7, bindings[7]) + value;
      case 7:
        value = _addInterpolationPart(v6, bindings[6]) + value;
      case 6:
        value = _addInterpolationPart(v5, bindings[5]) + value;
      case 5:
        value = _addInterpolationPart(v4, bindings[4]) + value;
      case 4:
        value = _addInterpolationPart(v3, bindings[3]) + value;
      case 3:
        value = _addInterpolationPart(v2, bindings[2]) + value;
      case 2:
        value = _addInterpolationPart(v1, bindings[1]) + value;
      case 1:
        value = _addInterpolationPart(v0, bindings[0]) + value;
    }
    value = def.text.prefix + value;
    const renderNode = asTextData(view, def.index).renderText;
    if (view.renderer) {
      view.renderer.setText(renderNode, value);
    } else {
      renderNode.nodeValue = value;
    }
  }
}

export function checkAndUpdateTextDynamic(view: ViewData, def: NodeDef, values: any[]) {
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
    value = def.text.prefix + value;
    const renderNode = asTextData(view, def.index).renderText;
    if (view.renderer) {
      view.renderer.setText(renderNode, value);
    } else {
      renderNode.nodeValue = value;
    }
  }
}

function _addInterpolationPart(value: any, binding: BindingDef): string {
  const valueStr = value != null ? value.toString() : '';
  return valueStr + binding.suffix;
}
