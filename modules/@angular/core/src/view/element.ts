/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {SecurityContext} from '../security';

import {BindingDef, BindingType, DebugContext, DisposableFn, ElementData, ElementOutputDef, NodeData, NodeDef, NodeFlags, NodeType, QueryValueType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, asElementData} from './types';
import {checkAndUpdateBinding, dispatchEvent, elementEventFullName, filterQueryId, getParentRenderElement, resolveViewDefinition, sliceErrorStack, splitMatchedQueriesDsl} from './util';

export function anchorDef(
    flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    ngContentIndex: number, childCount: number, templateFactory?: ViewDefinitionFactory): NodeDef {
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  // skip the call to sliceErrorStack itself + the call to this function.
  const source = isDevMode() ? sliceErrorStack(2, 3) : '';
  const template = templateFactory ? resolveViewDefinition(templateFactory) : null;

  return {
    type: NodeType.Element,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    renderParent: undefined,
    bindingIndex: undefined,
    disposableIndex: undefined,
    // regular values
    flags,
    childFlags: 0,
    childMatchedQueries: 0, matchedQueries, matchedQueryIds, references, ngContentIndex, childCount,
    bindings: [],
    disposableCount: 0,
    element: {
      name: undefined,
      attrs: undefined,
      outputs: [], template, source,
      // will bet set by the view definition
      component: undefined,
      publicProviders: undefined,
      allProviders: undefined,
    },
    provider: undefined,
    text: undefined,
    pureExpression: undefined,
    query: undefined,
    ngContent: undefined
  };
}

export function elementDef(
    flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    ngContentIndex: number, childCount: number, name: string,
    fixedAttrs: {[name: string]: string} = {},
    bindings?:
        ([BindingType.ElementClass, string] | [BindingType.ElementStyle, string, string] |
         [BindingType.ElementAttribute | BindingType.ElementProperty, string, SecurityContext])[],
    outputs?: (string | [string, string])[]): NodeDef {
  // skip the call to sliceErrorStack itself + the call to this function.
  const source = isDevMode() ? sliceErrorStack(2, 3) : '';
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  bindings = bindings || [];
  const bindingDefs: BindingDef[] = new Array(bindings.length);
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
    bindingDefs[i] = {type: bindingType, name, nonMinifiedName: name, securityContext, suffix};
  }
  outputs = outputs || [];
  const outputDefs: ElementOutputDef[] = new Array(outputs.length);
  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];
    let target: string;
    let eventName: string;
    if (Array.isArray(output)) {
      [target, eventName] = output;
    } else {
      eventName = output;
    }
    outputDefs[i] = {eventName: eventName, target: target};
  }
  return {
    type: NodeType.Element,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    renderParent: undefined,
    bindingIndex: undefined,
    disposableIndex: undefined,
    // regular values
    flags,
    childFlags: 0,
    childMatchedQueries: 0, matchedQueries, matchedQueryIds, references, ngContentIndex, childCount,
    bindings: bindingDefs,
    disposableCount: outputDefs.length,
    element: {
      name,
      attrs: fixedAttrs,
      outputs: outputDefs, source,
      template: undefined,
      // will bet set by the view definition
      component: undefined,
      publicProviders: undefined,
      allProviders: undefined,
    },
    provider: undefined,
    text: undefined,
    pureExpression: undefined,
    query: undefined,
    ngContent: undefined
  };
}

export function createElement(view: ViewData, renderHost: any, def: NodeDef): ElementData {
  const elDef = def.element;
  const rootSelectorOrNode = view.root.selectorOrNode;
  const renderer = view.root.renderer;
  let el: any;
  if (view.parent || !rootSelectorOrNode) {
    if (elDef.name) {
      // TODO(vicb): move the namespace to the node definition
      const nsAndName = splitNamespace(elDef.name);
      el = renderer.createElement(nsAndName[1], nsAndName[0]);
    } else {
      el = renderer.createComment('');
    }
    const parentEl = getParentRenderElement(view, renderHost, def);
    if (parentEl) {
      renderer.appendChild(parentEl, el);
    }
  } else {
    el = renderer.selectRootElement(rootSelectorOrNode);
  }
  if (elDef.attrs) {
    for (let attrName in elDef.attrs) {
      // TODO(vicb): move the namespace to the node definition
      const nsAndName = splitNamespace(attrName);
      renderer.setAttribute(el, nsAndName[1], elDef.attrs[attrName], nsAndName[0]);
    }
  }
  if (elDef.outputs.length) {
    for (let i = 0; i < elDef.outputs.length; i++) {
      const output = elDef.outputs[i];
      const handleEventClosure = renderEventHandlerClosure(
          view, def.index, elementEventFullName(output.target, output.eventName));
      const disposable =
          <any>renderer.listen(output.target || el, output.eventName, handleEventClosure);
      view.disposables[def.disposableIndex + i] = disposable;
    }
  }
  return {
    renderElement: el,
    embeddedViews: (def.flags & NodeFlags.HasEmbeddedViews) ? [] : undefined,
    projectedViews: undefined
  };
}

function renderEventHandlerClosure(view: ViewData, index: number, eventName: string) {
  return (event: any) => dispatchEvent(view, index, eventName, event);
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
  const renderNode = asElementData(view, def.index).renderElement;
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
  let renderValue = securityContext ? view.root.sanitizer.sanitize(securityContext, value) : value;
  renderValue = renderValue != null ? renderValue.toString() : null;
  const renderer = view.root.renderer;
  // TODO(vicb): move the namespace to the node definition
  const nsAndName = splitNamespace(name);
  if (value != null) {
    renderer.setAttribute(renderNode, nsAndName[1], renderValue, nsAndName[0]);
  } else {
    renderer.removeAttribute(renderNode, nsAndName[1], nsAndName[0]);
  }
}

function setElementClass(view: ViewData, renderNode: any, name: string, value: boolean) {
  const renderer = view.root.renderer;
  if (value) {
    renderer.addClass(renderNode, name);
  } else {
    renderer.removeClass(renderNode, name);
  }
}

function setElementStyle(
    view: ViewData, binding: BindingDef, renderNode: any, name: string, value: any) {
  let renderValue = view.root.sanitizer.sanitize(SecurityContext.STYLE, value);
  if (renderValue != null) {
    renderValue = renderValue.toString();
    const unit = binding.suffix;
    if (unit != null) {
      renderValue = renderValue + unit;
    }
  } else {
    renderValue = null;
  }
  const renderer = view.root.renderer;
  if (renderValue != null) {
    renderer.setStyle(renderNode, name, renderValue, false, false);
  } else {
    renderer.removeStyle(renderNode, name, false);
  }
}

function setElementProperty(
    view: ViewData, binding: BindingDef, renderNode: any, name: string, value: any) {
  const securityContext = binding.securityContext;
  let renderValue = securityContext ? view.root.sanitizer.sanitize(securityContext, value) : value;
  view.root.renderer.setProperty(renderNode, name, renderValue);
}

const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

function splitNamespace(name: string): string[] {
  if (name[0] === ':') {
    const match = name.match(NS_PREFIX_RE);
    return [match[1], match[2]];
  }
  return ['', name];
}
