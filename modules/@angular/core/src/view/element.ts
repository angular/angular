/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {SecurityContext} from '../security';

import {BindingDef, BindingType, DebugContext, DisposableFn, ElementData, ElementHandleEventFn, ElementOutputDef, NodeData, NodeDef, NodeFlags, NodeType, QueryValueType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, asElementData} from './types';
import {checkAndUpdateBinding, dispatchEvent, elementEventFullName, filterQueryId, getParentRenderElement, resolveViewDefinition, sliceErrorStack, splitMatchedQueriesDsl, splitNamespace} from './util';

const NOOP: any = () => {};

export function anchorDef(
    flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    ngContentIndex: number, childCount: number, handleEvent?: ElementHandleEventFn,
    templateFactory?: ViewDefinitionFactory): NodeDef {
  if (!handleEvent) {
    handleEvent = NOOP;
  }
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
      ns: undefined,
      name: undefined,
      attrs: undefined,
      outputs: [], template, source,
      // will bet set by the view definition
      component: undefined,
      publicProviders: undefined,
      allProviders: undefined, handleEvent
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
    ngContentIndex: number, childCount: number, namespaceAndName: string,
    fixedAttrs: [string, string][] = [],
    bindings?:
        ([BindingType.ElementClass, string] | [BindingType.ElementStyle, string, string] |
         [BindingType.ElementAttribute | BindingType.ElementProperty, string, SecurityContext])[],
    outputs?: (string | [string, string])[], handleEvent?: ElementHandleEventFn): NodeDef {
  if (!handleEvent) {
    handleEvent = NOOP;
  }
  // skip the call to sliceErrorStack itself + the call to this function.
  const source = isDevMode() ? sliceErrorStack(2, 3) : '';
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  let ns: string;
  let name: string;
  if (namespaceAndName) {
    [ns, name] = splitNamespace(namespaceAndName);
  }
  bindings = bindings || [];
  const bindingDefs: BindingDef[] = new Array(bindings.length);
  for (let i = 0; i < bindings.length; i++) {
    const entry = bindings[i];
    let bindingDef: BindingDef;
    const bindingType = entry[0];
    const [ns, name] = splitNamespace(entry[1]);
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
    bindingDefs[i] = {type: bindingType, ns, name, nonMinifiedName: name, securityContext, suffix};
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
  fixedAttrs = fixedAttrs || [];
  const attrs = <[string, string, string][]>fixedAttrs.map(([namespaceAndName, value]) => {
    const [ns, name] = splitNamespace(namespaceAndName);
    return [ns, name, value];
  });
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
      ns,
      name,
      attrs,
      outputs: outputDefs, source,
      template: undefined,
      // will bet set by the view definition
      component: undefined,
      publicProviders: undefined,
      allProviders: undefined, handleEvent,
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
  const renderer = view.renderer;
  let el: any;
  if (view.parent || !rootSelectorOrNode) {
    if (elDef.name) {
      el = renderer.createElement(elDef.name, elDef.ns);
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
    for (let i = 0; i < elDef.attrs.length; i++) {
      const [ns, name, value] = elDef.attrs[i];
      renderer.setAttribute(el, name, value, ns);
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
  const bindLen = def.bindings.length;
  if (bindLen > 0) checkAndUpdateElementValue(view, def, 0, v0);
  if (bindLen > 1) checkAndUpdateElementValue(view, def, 1, v1);
  if (bindLen > 2) checkAndUpdateElementValue(view, def, 2, v2);
  if (bindLen > 3) checkAndUpdateElementValue(view, def, 3, v3);
  if (bindLen > 4) checkAndUpdateElementValue(view, def, 4, v4);
  if (bindLen > 5) checkAndUpdateElementValue(view, def, 5, v5);
  if (bindLen > 6) checkAndUpdateElementValue(view, def, 6, v6);
  if (bindLen > 7) checkAndUpdateElementValue(view, def, 7, v7);
  if (bindLen > 8) checkAndUpdateElementValue(view, def, 8, v8);
  if (bindLen > 9) checkAndUpdateElementValue(view, def, 9, v9);
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
  const renderNode = asElementData(view, def.index).renderElement;
  const name = binding.name;
  switch (binding.type) {
    case BindingType.ElementAttribute:
      setElementAttribute(view, binding, renderNode, binding.ns, name, value);
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
    view: ViewData, binding: BindingDef, renderNode: any, ns: string, name: string, value: any) {
  const securityContext = binding.securityContext;
  let renderValue = securityContext ? view.root.sanitizer.sanitize(securityContext, value) : value;
  renderValue = renderValue != null ? renderValue.toString() : null;
  const renderer = view.renderer;
  if (value != null) {
    renderer.setAttribute(renderNode, name, renderValue, ns);
  } else {
    renderer.removeAttribute(renderNode, name, ns);
  }
}

function setElementClass(view: ViewData, renderNode: any, name: string, value: boolean) {
  const renderer = view.renderer;
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
  const renderer = view.renderer;
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
  view.renderer.setProperty(renderNode, name, renderValue);
}
