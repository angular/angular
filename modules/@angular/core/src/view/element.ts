/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isDevMode} from '../application_ref';
import {Renderer2, RendererType2} from '../render/api';
import {SecurityContext} from '../security';

import {BindingDef, BindingType, DebugContext, DisposableFn, ElementData, ElementHandleEventFn, NodeData, NodeDef, NodeFlags, OutputDef, OutputType, QueryValueType, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, asElementData, asProviderData} from './types';
import {checkAndUpdateBinding, dispatchEvent, elementEventFullName, filterQueryId, getParentRenderElement, resolveViewDefinition, sliceErrorStack, splitMatchedQueriesDsl, splitNamespace} from './util';

const NOOP: any = () => {};

export function anchorDef(
    flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    ngContentIndex: number, childCount: number, handleEvent?: ElementHandleEventFn,
    templateFactory?: ViewDefinitionFactory): NodeDef {
  if (!handleEvent) {
    handleEvent = NOOP;
  }
  flags |= NodeFlags.TypeElement;
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  // skip the call to sliceErrorStack itself + the call to this function.
  const source = isDevMode() ? sliceErrorStack(2, 3) : '';
  const template = templateFactory ? resolveViewDefinition(templateFactory) : null;

  return {
    // will bet set by the view definition
    index: undefined,
    parent: undefined,
    renderParent: undefined,
    bindingIndex: undefined,
    outputIndex: undefined,
    // regular values
    flags,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0, matchedQueries, matchedQueryIds, references, ngContentIndex, childCount,
    bindings: [],
    outputs: [],
    element: {
      ns: undefined,
      name: undefined,
      attrs: undefined, template, source,
      componentProvider: undefined,
      componentView: undefined,
      componentRendererType: undefined,
      publicProviders: undefined,
      allProviders: undefined, handleEvent
    },
    provider: undefined,
    text: undefined,
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
         [
           BindingType.ElementAttribute | BindingType.ElementProperty |
               BindingType.ComponentHostProperty,
           string, SecurityContext
         ])[],
    outputs?: ([string, string])[], handleEvent?: ElementHandleEventFn,
    componentView?: () => ViewDefinition, componentRendererType?: RendererType2): NodeDef {
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
      case BindingType.ComponentHostProperty:
        securityContext = <SecurityContext>entry[2];
        break;
    }
    bindingDefs[i] = {type: bindingType, ns, name, nonMinifiedName: name, securityContext, suffix};
  }
  outputs = outputs || [];
  const outputDefs: OutputDef[] = new Array(outputs.length);
  for (let i = 0; i < outputs.length; i++) {
    const [target, eventName] = outputs[i];
    outputDefs[i] = {
      type: OutputType.ElementOutput,
      target: <any>target, eventName,
      propName: undefined
    };
  }
  fixedAttrs = fixedAttrs || [];
  const attrs = <[string, string, string][]>fixedAttrs.map(([namespaceAndName, value]) => {
    const [ns, name] = splitNamespace(namespaceAndName);
    return [ns, name, value];
  });
  // This is needed as the jit compiler always uses an empty hash as default RendererType2,
  // which is not filled for host views.
  if (componentRendererType && componentRendererType.encapsulation == null) {
    componentRendererType = null;
  }
  if (componentView) {
    flags |= NodeFlags.ComponentView;
  }
  flags |= NodeFlags.TypeElement;
  return {
    // will bet set by the view definition
    index: undefined,
    parent: undefined,
    renderParent: undefined,
    bindingIndex: undefined,
    outputIndex: undefined,
    // regular values
    flags,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0, matchedQueries, matchedQueryIds, references, ngContentIndex, childCount,
    bindings: bindingDefs,
    outputs: outputDefs,
    element: {
      ns,
      name,
      attrs,
      source,
      template: undefined,
      // will bet set by the view definition
      componentProvider: undefined, componentView, componentRendererType,
      publicProviders: undefined,
      allProviders: undefined, handleEvent,
    },
    provider: undefined,
    text: undefined,
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
  return el;
}

export function listenToElementOutputs(view: ViewData, compView: ViewData, def: NodeDef, el: any) {
  for (let i = 0; i < def.outputs.length; i++) {
    const output = def.outputs[i];
    const handleEventClosure = renderEventHandlerClosure(
        view, def.index, elementEventFullName(output.target, output.eventName));
    let listenTarget = output.target;
    let listenerView = view;
    if (output.target === 'component') {
      listenTarget = null;
      listenerView = compView;
    }
    const disposable =
        <any>listenerView.renderer.listen(listenTarget || el, output.eventName, handleEventClosure);
    view.disposables[def.outputIndex + i] = disposable;
  }
}

function renderEventHandlerClosure(view: ViewData, index: number, eventName: string) {
  return (event: any) => dispatchEvent(view, index, eventName, event);
}


export function checkAndUpdateElementInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any): boolean {
  const bindLen = def.bindings.length;
  let changed = false;
  if (bindLen > 0 && checkAndUpdateElementValue(view, def, 0, v0)) changed = true;
  if (bindLen > 1 && checkAndUpdateElementValue(view, def, 1, v1)) changed = true;
  if (bindLen > 2 && checkAndUpdateElementValue(view, def, 2, v2)) changed = true;
  if (bindLen > 3 && checkAndUpdateElementValue(view, def, 3, v3)) changed = true;
  if (bindLen > 4 && checkAndUpdateElementValue(view, def, 4, v4)) changed = true;
  if (bindLen > 5 && checkAndUpdateElementValue(view, def, 5, v5)) changed = true;
  if (bindLen > 6 && checkAndUpdateElementValue(view, def, 6, v6)) changed = true;
  if (bindLen > 7 && checkAndUpdateElementValue(view, def, 7, v7)) changed = true;
  if (bindLen > 8 && checkAndUpdateElementValue(view, def, 8, v8)) changed = true;
  if (bindLen > 9 && checkAndUpdateElementValue(view, def, 9, v9)) changed = true;
  return changed;
}

export function checkAndUpdateElementDynamic(view: ViewData, def: NodeDef, values: any[]): boolean {
  let changed = false;
  for (let i = 0; i < values.length; i++) {
    if (checkAndUpdateElementValue(view, def, i, values[i])) changed = true;
  }
  return changed;
}

function checkAndUpdateElementValue(view: ViewData, def: NodeDef, bindingIdx: number, value: any) {
  if (!checkAndUpdateBinding(view, def, bindingIdx, value)) {
    return false;
  }
  const binding = def.bindings[bindingIdx];
  const elData = asElementData(view, def.index);
  const renderNode = elData.renderElement;
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
    case BindingType.ComponentHostProperty:
      setElementProperty(elData.componentView, binding, renderNode, name, value);
      break;
  }
  return true;
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
