/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';
import {RendererType2} from '../render/api_flags';
import {SecurityContext} from '../sanitization/security';

import {asElementData, BindingDef, BindingFlags, ElementData, ElementHandleEventFn, NodeDef, NodeFlags, OutputDef, OutputType, QueryValueType, ViewData, ViewDefinitionFactory} from './types';
import {calcBindingFlags, checkAndUpdateBinding, dispatchEvent, elementEventFullName, getParentRenderElement, NOOP, resolveDefinition, resolveRendererType2, splitMatchedQueriesDsl, splitNamespace} from './util';

export function anchorDef(
    flags: NodeFlags, matchedQueriesDsl: null|[string | number, QueryValueType][],
    ngContentIndex: null|number, childCount: number, handleEvent?: null|ElementHandleEventFn,
    templateFactory?: ViewDefinitionFactory): NodeDef {
  flags |= NodeFlags.TypeElement;
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  const template = templateFactory ? resolveDefinition(templateFactory) : null;

  return {
    // will bet set by the view definition
    nodeIndex: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    flags,
    checkIndex: -1,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0,
    matchedQueries,
    matchedQueryIds,
    references,
    ngContentIndex,
    childCount,
    bindings: [],
    bindingFlags: 0,
    outputs: [],
    element: {
      ns: null,
      name: null,
      attrs: null,
      template,
      componentProvider: null,
      componentView: null,
      componentRendererType: null,
      publicProviders: null,
      allProviders: null,
      handleEvent: handleEvent || NOOP
    },
    provider: null,
    text: null,
    query: null,
    ngContent: null
  };
}

export function elementDef(
    checkIndex: number, flags: NodeFlags,
    matchedQueriesDsl: null|[string | number, QueryValueType][], ngContentIndex: null|number,
    childCount: number, namespaceAndName: string|null, fixedAttrs: null|[string, string][] = [],
    bindings?: null|[BindingFlags, string, string | SecurityContext | null][],
    outputs?: null|([string, string])[], handleEvent?: null|ElementHandleEventFn,
    componentView?: null|ViewDefinitionFactory,
    componentRendererType?: RendererType2|null): NodeDef {
  if (!handleEvent) {
    handleEvent = NOOP;
  }
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  let ns: string = null!;
  let name: string = null!;
  if (namespaceAndName) {
    [ns, name] = splitNamespace(namespaceAndName);
  }
  bindings = bindings || [];
  const bindingDefs: BindingDef[] = [];
  for (let i = 0; i < bindings.length; i++) {
    const [bindingFlags, namespaceAndName, suffixOrSecurityContext] = bindings[i];

    const [ns, name] = splitNamespace(namespaceAndName);
    let securityContext: SecurityContext = undefined!;
    let suffix: string = undefined!;
    switch (bindingFlags & BindingFlags.Types) {
      case BindingFlags.TypeElementStyle:
        suffix = <string>suffixOrSecurityContext;
        break;
      case BindingFlags.TypeElementAttribute:
      case BindingFlags.TypeProperty:
        securityContext = <SecurityContext>suffixOrSecurityContext;
        break;
    }
    bindingDefs[i] =
        {flags: bindingFlags, ns, name, nonMinifiedName: name, securityContext, suffix};
  }
  outputs = outputs || [];
  const outputDefs: OutputDef[] = [];
  for (let i = 0; i < outputs.length; i++) {
    const [target, eventName] = outputs[i];
    outputDefs[i] =
        {type: OutputType.ElementOutput, target: <any>target, eventName, propName: null};
  }
  fixedAttrs = fixedAttrs || [];
  const attrs = <[string, string, string][]>fixedAttrs.map(([namespaceAndName, value]) => {
    const [ns, name] = splitNamespace(namespaceAndName);
    return [ns, name, value];
  });
  componentRendererType = resolveRendererType2(componentRendererType);
  if (componentView) {
    flags |= NodeFlags.ComponentView;
  }
  flags |= NodeFlags.TypeElement;
  return {
    // will bet set by the view definition
    nodeIndex: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    checkIndex,
    flags,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0,
    matchedQueries,
    matchedQueryIds,
    references,
    ngContentIndex,
    childCount,
    bindings: bindingDefs,
    bindingFlags: calcBindingFlags(bindingDefs),
    outputs: outputDefs,
    element: {
      ns,
      name,
      attrs,
      template: null,
      // will bet set by the view definition
      componentProvider: null,
      componentView: componentView || null,
      componentRendererType: componentRendererType,
      publicProviders: null,
      allProviders: null,
      handleEvent: handleEvent || NOOP,
    },
    provider: null,
    text: null,
    query: null,
    ngContent: null
  };
}

export function createElement(view: ViewData, renderHost: any, def: NodeDef): ElementData {
  const elDef = def.element!;
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
    // when using native Shadow DOM, do not clear the root element contents to allow slot projection
    const preserveContent =
        (!!elDef.componentRendererType &&
         elDef.componentRendererType.encapsulation === ViewEncapsulation.ShadowDom);
    el = renderer.selectRootElement(rootSelectorOrNode, preserveContent);
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
        view, def.nodeIndex, elementEventFullName(output.target, output.eventName));
    let listenTarget: 'window'|'document'|'body'|'component'|null = output.target;
    let listenerView = view;
    if (output.target === 'component') {
      listenTarget = null;
      listenerView = compView;
    }
    const disposable =
        <any>listenerView.renderer.listen(listenTarget || el, output.eventName, handleEventClosure);
    view.disposables![def.outputIndex + i] = disposable;
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
  const elData = asElementData(view, def.nodeIndex);
  const renderNode = elData.renderElement;
  const name = binding.name!;
  switch (binding.flags & BindingFlags.Types) {
    case BindingFlags.TypeElementAttribute:
      setElementAttribute(view, binding, renderNode, binding.ns, name, value);
      break;
    case BindingFlags.TypeElementClass:
      setElementClass(view, renderNode, name, value);
      break;
    case BindingFlags.TypeElementStyle:
      setElementStyle(view, binding, renderNode, name, value);
      break;
    case BindingFlags.TypeProperty:
      const bindView = (def.flags & NodeFlags.ComponentView &&
                        binding.flags & BindingFlags.SyntheticHostProperty) ?
          elData.componentView :
          view;
      setElementProperty(bindView, binding, renderNode, name, value);
      break;
  }
  return true;
}

function setElementAttribute(
    view: ViewData, binding: BindingDef, renderNode: any, ns: string|null, name: string,
    value: any) {
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
  let renderValue: string|null =
      view.root.sanitizer.sanitize(SecurityContext.STYLE, value as {} | string);
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
    renderer.setStyle(renderNode, name, renderValue);
  } else {
    renderer.removeStyle(renderNode, name);
  }
}

function setElementProperty(
    view: ViewData, binding: BindingDef, renderNode: any, name: string, value: any) {
  const securityContext = binding.securityContext;
  let renderValue = securityContext ? view.root.sanitizer.sanitize(securityContext, value) : value;
  view.renderer.setProperty(renderNode, name, renderValue);
}
