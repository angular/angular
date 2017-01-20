/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../security';

import {BindingDef, BindingType, NodeData, NodeDef, NodeFlags, NodeType, ViewData, ViewFlags} from './types';
import {checkAndUpdateBinding, setBindingDebugInfo} from './util';

export function elementDef(
    flags: NodeFlags, childCount: number, name: string, fixedAttrs: {[name: string]: string} = {},
    bindings: ([BindingType.ElementClass, string] | [BindingType.ElementStyle, string, string] | [
      BindingType.ElementAttribute | BindingType.ElementProperty, string, SecurityContext
    ])[] = []): NodeDef {
  const bindingDefs = new Array(bindings.length);
  for (let i = 0; i < bindings.length; i++) {
    const entry = bindings[i];
    let bindingDef: BindingDef;
    const bindingType = entry[0];
    const name = entry[1];
    let securityContext: SecurityContext;
    let suffix: string;
    switch (bindingType) {
      case BindingType.ElementStyle:
        suffix = <string>entry[2];
        break;
      case BindingType.ElementAttribute:
      case BindingType.ElementProperty:
        securityContext = <SecurityContext>entry[2];
        break;
    }
    bindingDefs[i] = {type: bindingType, name, nonMinfiedName: name, securityContext, suffix};
  }
  return {
    type: NodeType.Element,
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
    bindings: bindingDefs,
    element: {name, attrs: fixedAttrs},
    provider: undefined,
    text: undefined,
    component: undefined,
    template: undefined
  };
}

export function createElement(view: ViewData, renderHost: any, def: NodeDef): NodeData {
  const parentNode = def.parent != null ? view.nodes[def.parent].renderNode : renderHost;
  const elDef = def.element;
  let el: any;
  if (view.renderer) {
    el = view.renderer.createElement(parentNode, elDef.name);
    if (elDef.attrs) {
      for (let attrName in elDef.attrs) {
        view.renderer.setElementAttribute(el, attrName, elDef.attrs[attrName]);
      }
    }
  } else {
    el = document.createElement(elDef.name);
    if (parentNode) {
      parentNode.appendChild(el);
    }
    if (elDef.attrs) {
      for (let attrName in elDef.attrs) {
        el.setAttribute(attrName, elDef.attrs[attrName]);
      }
    }
  }
  return {
    renderNode: el,
    provider: undefined,
    embeddedViews: (def.flags & NodeFlags.HasEmbeddedViews) ? [] : undefined,
    componentView: undefined
  };
}

export function checkAndUpdateElementInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any) {
  // Note: fallthrough is intended!
  switch (def.bindings.length) {
    case 10:
      checkAndUpdateElementValue(view, def, 9, v9);
    case 9:
      checkAndUpdateElementValue(view, def, 8, v8);
    case 8:
      checkAndUpdateElementValue(view, def, 7, v7);
    case 7:
      checkAndUpdateElementValue(view, def, 6, v6);
    case 6:
      checkAndUpdateElementValue(view, def, 5, v5);
    case 5:
      checkAndUpdateElementValue(view, def, 4, v4);
    case 4:
      checkAndUpdateElementValue(view, def, 3, v3);
    case 3:
      checkAndUpdateElementValue(view, def, 2, v2);
    case 2:
      checkAndUpdateElementValue(view, def, 1, v1);
    case 1:
      checkAndUpdateElementValue(view, def, 0, v0);
  }
}

export function checkAndUpdateElementDynamic(view: ViewData, def: NodeDef, values: any[]) {
  for (let i = 0; i < values.length; i++) {
    checkAndUpdateElementValue(view, def, i, values[i]);
  }
}

function checkAndUpdateElementValue(view: ViewData, def: NodeDef, bindingIdx: number, value: any) {
  if (!checkAndUpdateBinding(view, def, bindingIdx, value)) {
    return;
  }

  const binding = def.bindings[bindingIdx];
  const name = binding.name;
  const renderNode = view.nodes[def.index].renderNode;
  switch (binding.type) {
    case BindingType.ElementAttribute:
      setElementAttribute(view, binding, renderNode, name, value);
      break;
    case BindingType.ElementClass:
      setElementClass(view, renderNode, name, value);
      break;
    case BindingType.ElementStyle:
      setElementStyle(view, binding, renderNode, name, value);
      break;
    case BindingType.ElementProperty:
      setElementProperty(view, binding, renderNode, name, value);
      break;
  }
}

function setElementAttribute(
    view: ViewData, binding: BindingDef, renderNode: any, name: string, value: any) {
  const securityContext = binding.securityContext;
  let renderValue = securityContext ? view.services.sanitize(securityContext, value) : value;
  renderValue = renderValue != null ? renderValue.toString() : null;
  if (view.renderer) {
    view.renderer.setElementAttribute(renderNode, name, renderValue);
  } else {
    if (value != null) {
      renderNode.setAttribute(name, renderValue);
    } else {
      renderNode.removeAttribute(name);
    }
  }
}

function setElementClass(view: ViewData, renderNode: any, name: string, value: boolean) {
  if (view.renderer) {
    view.renderer.setElementClass(renderNode, name, value);
  } else {
    if (value) {
      renderNode.classList.add(name);
    } else {
      renderNode.classList.remove(name);
    }
  }
}

function setElementStyle(
    view: ViewData, binding: BindingDef, renderNode: any, name: string, value: any) {
  let renderValue = view.services.sanitize(SecurityContext.STYLE, value);
  if (renderValue != null) {
    renderValue = renderValue.toString();
    const unit = binding.suffix;
    if (unit != null) {
      renderValue = renderValue + unit;
    }
  } else {
    renderValue = null;
  }
  if (view.renderer) {
    view.renderer.setElementStyle(renderNode, name, renderValue);
  } else {
    if (renderValue != null) {
      renderNode.style[name] = renderValue;
    } else {
      // IE requires '' instead of null
      // see https://github.com/angular/angular/issues/7916
      (renderNode.style as any)[name] = '';
    }
  }
}

function setElementProperty(
    view: ViewData, binding: BindingDef, renderNode: any, name: string, value: any) {
  const securityContext = binding.securityContext;
  let renderValue = securityContext ? view.services.sanitize(securityContext, value) : value;
  if (view.renderer) {
    view.renderer.setElementProperty(renderNode, name, renderValue);
    if (view.def.flags & ViewFlags.LogBindingUpdate) {
      setBindingDebugInfo(view.renderer, renderNode, name, renderValue);
    }
  } else {
    renderNode[name] = renderValue;
  }
}
