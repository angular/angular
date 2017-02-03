/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, SimpleChange, SimpleChanges} from '../change_detection/change_detection';
import {Injector} from '../di';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import * as v1renderer from '../render/api';
import {Type} from '../type';

import {createChangeDetectorRef, createInjector, createTemplateRef, createViewContainerRef} from './refs';
import {BindingDef, BindingType, DepDef, DepFlags, DisposableFn, NodeData, NodeDef, NodeFlags, NodeType, ProviderData, ProviderOutputDef, ProviderType, QueryBindingType, QueryDef, QueryValueType, RootData, Services, ViewData, ViewDefinition, ViewFlags, ViewState, asElementData, asProviderData} from './types';
import {checkAndUpdateBinding, dispatchEvent, findElementDef, isComponentView, parentDiIndex, tokenKey, unwrapValue} from './util';

const RendererV1TokenKey = tokenKey(v1renderer.Renderer);
const ElementRefTokenKey = tokenKey(ElementRef);
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
const TemplateRefTokenKey = tokenKey(TemplateRef);
const ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
const InjectorRefTokenKey = tokenKey(Injector);

const NOT_CREATED = new Object();

export function directiveDef(
    flags: NodeFlags, matchedQueries: [string, QueryValueType][], childCount: number, ctor: any,
    deps: ([DepFlags, any] | any)[], props?: {[name: string]: [number, string]},
    outputs?: {[name: string]: string}, component?: () => ViewDefinition): NodeDef {
  return _providerDef(
      flags, matchedQueries, childCount, ProviderType.Class, ctor, ctor, deps, props, outputs,
      component);
}

export function providerDef(
    flags: NodeFlags, matchedQueries: [string, QueryValueType][], type: ProviderType, token: any,
    value: any, deps: ([DepFlags, any] | any)[]): NodeDef {
  return _providerDef(flags, matchedQueries, 0, type, token, value, deps);
}

export function _providerDef(
    flags: NodeFlags, matchedQueries: [string, QueryValueType][], childCount: number,
    type: ProviderType, token: any, value: any, deps: ([DepFlags, any] | any)[],
    props?: {[name: string]: [number, string]}, outputs?: {[name: string]: string},
    component?: () => ViewDefinition): NodeDef {
  const matchedQueryDefs: {[queryId: string]: QueryValueType} = {};
  if (matchedQueries) {
    matchedQueries.forEach(([queryId, valueType]) => { matchedQueryDefs[queryId] = valueType; });
  }

  const bindings: BindingDef[] = [];
  if (props) {
    for (let prop in props) {
      const [bindingIndex, nonMinifiedName] = props[prop];
      bindings[bindingIndex] = {
        type: BindingType.ProviderProperty,
        name: prop, nonMinifiedName,
        securityContext: undefined,
        suffix: undefined
      };
    }
  }
  const outputDefs: ProviderOutputDef[] = [];
  if (outputs) {
    for (let propName in outputs) {
      outputDefs.push({propName, eventName: outputs[propName]});
    }
  }
  const depDefs: DepDef[] = deps.map(value => {
    let token: any;
    let flags: DepFlags;
    if (Array.isArray(value)) {
      [flags, token] = value;
    } else {
      flags = DepFlags.None;
      token = value;
    }
    return {flags, token, tokenKey: tokenKey(token)};
  });
  if (component) {
    flags = flags | NodeFlags.HasComponent;
  }

  return {
    type: NodeType.Provider,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    childFlags: undefined,
    childMatchedQueries: undefined,
    bindingIndex: undefined,
    disposableIndex: undefined,
    // regular values
    flags,
    matchedQueries: matchedQueryDefs,
    ngContentIndex: undefined, childCount, bindings,
    disposableCount: outputDefs.length,
    element: undefined,
    provider: {
      type,
      token,
      tokenKey: tokenKey(token), value,
      deps: depDefs,
      outputs: outputDefs, component
    },
    text: undefined,
    pureExpression: undefined,
    query: undefined,
    ngContent: undefined
  };
}

export function createProviderInstance(view: ViewData, def: NodeDef): any {
  const providerDef = def.provider;
  return def.flags & NodeFlags.LazyProvider ? NOT_CREATED : createInstance(view, def);
}

function eventHandlerClosure(view: ViewData, index: number, eventName: string) {
  return (event: any) => dispatchEvent(view, index, eventName, event);
}

export function checkAndUpdateProviderInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any) {
  const provider = asProviderData(view, def.index).instance;
  let changes: SimpleChanges;
  // Note: fallthrough is intended!
  switch (def.bindings.length) {
    case 10:
      changes = checkAndUpdateProp(view, provider, def, 9, v9, changes);
    case 9:
      changes = checkAndUpdateProp(view, provider, def, 8, v8, changes);
    case 8:
      changes = checkAndUpdateProp(view, provider, def, 7, v7, changes);
    case 7:
      changes = checkAndUpdateProp(view, provider, def, 6, v6, changes);
    case 6:
      changes = checkAndUpdateProp(view, provider, def, 5, v5, changes);
    case 5:
      changes = checkAndUpdateProp(view, provider, def, 4, v4, changes);
    case 4:
      changes = checkAndUpdateProp(view, provider, def, 3, v3, changes);
    case 3:
      changes = checkAndUpdateProp(view, provider, def, 2, v2, changes);
    case 2:
      changes = checkAndUpdateProp(view, provider, def, 1, v1, changes);
    case 1:
      changes = checkAndUpdateProp(view, provider, def, 0, v0, changes);
  }
  if (changes) {
    provider.ngOnChanges(changes);
  }
  if ((view.state & ViewState.FirstCheck) && (def.flags & NodeFlags.OnInit)) {
    provider.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    provider.ngDoCheck();
  }
}

export function checkAndUpdateProviderDynamic(view: ViewData, def: NodeDef, values: any[]) {
  const provider = asProviderData(view, def.index).instance;
  let changes: SimpleChanges;
  for (let i = 0; i < values.length; i++) {
    changes = checkAndUpdateProp(view, provider, def, i, values[i], changes);
  }
  if (changes) {
    provider.ngOnChanges(changes);
  }
  if ((view.state & ViewState.FirstCheck) && (def.flags & NodeFlags.OnInit)) {
    provider.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    provider.ngDoCheck();
  }
}

function createInstance(view: ViewData, nodeDef: NodeDef): any {
  const providerDef = nodeDef.provider;
  let injectable: any;
  switch (providerDef.type) {
    case ProviderType.Class:
      injectable =
          createClass(view, nodeDef.index, nodeDef.parent, providerDef.value, providerDef.deps);
      break;
    case ProviderType.Factory:
      injectable =
          callFactory(view, nodeDef.index, nodeDef.parent, providerDef.value, providerDef.deps);
      break;
    case ProviderType.UseExisting:
      injectable = resolveDep(view, nodeDef.index, nodeDef.parent, providerDef.deps[0]);
      break;
    case ProviderType.Value:
      injectable = providerDef.value;
      break;
  }
  if (providerDef.outputs.length) {
    for (let i = 0; i < providerDef.outputs.length; i++) {
      const output = providerDef.outputs[i];
      const subscription = injectable[output.propName].subscribe(
          eventHandlerClosure(view, nodeDef.parent, output.eventName));
      view.disposables[nodeDef.disposableIndex + i] = subscription.unsubscribe.bind(subscription);
    }
  }
  return injectable;
}

function createClass(
    view: ViewData, requestorNodeIndex: number, elIndex: number, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = new ctor();
      break;
    case 1:
      injectable = new ctor(resolveDep(view, requestorNodeIndex, elIndex, deps[0]));
      break;
    case 2:
      injectable = new ctor(
          resolveDep(view, requestorNodeIndex, elIndex, deps[0]),
          resolveDep(view, requestorNodeIndex, elIndex, deps[1]));
      break;
    case 3:
      injectable = new ctor(
          resolveDep(view, requestorNodeIndex, elIndex, deps[0]),
          resolveDep(view, requestorNodeIndex, elIndex, deps[1]),
          resolveDep(view, requestorNodeIndex, elIndex, deps[2]));
      break;
    default:
      const depValues = new Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, requestorNodeIndex, elIndex, deps[i]);
      }
      injectable = new ctor(...depValues);
  }
  return injectable;
}

function callFactory(
    view: ViewData, requestorNodeIndex: number, elIndex: number, factory: any,
    deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = factory();
      break;
    case 1:
      injectable = factory(resolveDep(view, requestorNodeIndex, elIndex, deps[0]));
      break;
    case 2:
      injectable = factory(
          resolveDep(view, requestorNodeIndex, elIndex, deps[0]),
          resolveDep(view, requestorNodeIndex, elIndex, deps[1]));
      break;
    case 3:
      injectable = factory(
          resolveDep(view, requestorNodeIndex, elIndex, deps[0]),
          resolveDep(view, requestorNodeIndex, elIndex, deps[1]),
          resolveDep(view, requestorNodeIndex, elIndex, deps[2]));
      break;
    default:
      const depValues = Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, requestorNodeIndex, elIndex, deps[i]);
      }
      injectable = factory(...depValues);
  }
  return injectable;
}

export function resolveDep(
    view: ViewData, requestNodeIndex: number, elIndex: number, depDef: DepDef,
    notFoundValue = Injector.THROW_IF_NOT_FOUND): any {
  const startView = view;
  if (depDef.flags & DepFlags.Optional) {
    notFoundValue = null;
  }
  const tokenKey = depDef.tokenKey;

  if (depDef.flags & DepFlags.SkipSelf) {
    requestNodeIndex = null;
    elIndex = view.def.nodes[elIndex].parent;
    while (elIndex == null && view) {
      elIndex = parentDiIndex(view);
      view = view.parent;
    }
  }

  while (view) {
    const elDef = view.def.nodes[elIndex];
    switch (tokenKey) {
      case RendererV1TokenKey: {
        let compView = view;
        while (compView && !isComponentView(compView)) {
          compView = compView.parent;
        }
        const rootRenderer: v1renderer.RootRenderer =
            view.root.injector.get(v1renderer.RootRenderer);

        // Note: Don't fill in the styles as they have been installed already!
        return rootRenderer.renderComponent(new v1renderer.RenderComponentType(
            view.def.component.id, '', 0, view.def.component.encapsulation, [], {}));
      }
      case ElementRefTokenKey:
        return new ElementRef(asElementData(view, elIndex).renderElement);
      case ViewContainerRefTokenKey:
        return createViewContainerRef(view, elIndex);
      case TemplateRefTokenKey:
        return createTemplateRef(view, elDef);
      case ChangeDetectorRefTokenKey:
        let cdView = view;
        // If we are still checking dependencies on the initial element...
        if (requestNodeIndex != null) {
          const requestorNodeDef = view.def.nodes[requestNodeIndex];
          if (requestorNodeDef.flags & NodeFlags.HasComponent) {
            cdView = asProviderData(view, requestNodeIndex).componentView;
          }
        }
        return createChangeDetectorRef(cdView);
      case InjectorRefTokenKey:
        return createInjector(view, elIndex);
      default:
        const providerIndex = elDef.element.providerIndices[tokenKey];
        if (providerIndex != null) {
          const providerData = asProviderData(view, providerIndex);
          if (providerData.instance === NOT_CREATED) {
            providerData.instance = createInstance(view, view.def.nodes[providerIndex]);
          }
          return providerData.instance;
        }
    }
    requestNodeIndex = null;
    elIndex = parentDiIndex(view);
    view = view.parent;
  }
  return startView.root.injector.get(depDef.token, notFoundValue);
}

function checkAndUpdateProp(
    view: ViewData, provider: any, def: NodeDef, bindingIdx: number, value: any,
    changes: SimpleChanges): SimpleChanges {
  let change: SimpleChange;
  let changed: boolean;
  if (def.flags & NodeFlags.OnChanges) {
    const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
    changed = checkAndUpdateBinding(view, def, bindingIdx, value);
    change = changed ?
        new SimpleChange(oldValue, value, (view.state & ViewState.FirstCheck) !== 0) :
        null;
  } else {
    changed = checkAndUpdateBinding(view, def, bindingIdx, value);
  }
  if (changed) {
    value = unwrapValue(value);
    const binding = def.bindings[bindingIdx];
    const propName = binding.name;
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    provider[propName] = value;
    if (change) {
      changes = changes || {};
      changes[binding.nonMinifiedName] = change;
    }
  }
  return changes;
}

export function callLifecycleHooksChildrenFirst(view: ViewData, lifecycles: NodeFlags) {
  if (!(view.def.nodeFlags & lifecycles)) {
    return;
  }
  const len = view.def.nodes.length;
  for (let i = 0; i < len; i++) {
    // We use the provider post order to call providers of children first.
    const nodeDef = view.def.reverseChildNodes[i];
    const nodeIndex = nodeDef.index;
    if (nodeDef.flags & lifecycles) {
      // a leaf
      Services.setCurrentNode(view, nodeIndex);
      callProviderLifecycles(asProviderData(view, nodeIndex).instance, nodeDef.flags & lifecycles);
    } else if ((nodeDef.childFlags & lifecycles) === 0) {
      // a parent with leafs
      // no child matches one of the lifecycles,
      // then skip the children
      i += nodeDef.childCount;
    }
  }
}

function callProviderLifecycles(provider: any, lifecycles: NodeFlags) {
  if (lifecycles & NodeFlags.AfterContentInit) {
    provider.ngAfterContentInit();
  }
  if (lifecycles & NodeFlags.AfterContentChecked) {
    provider.ngAfterContentChecked();
  }
  if (lifecycles & NodeFlags.AfterViewInit) {
    provider.ngAfterViewInit();
  }
  if (lifecycles & NodeFlags.AfterViewChecked) {
    provider.ngAfterViewChecked();
  }
  if (lifecycles & NodeFlags.OnDestroy) {
    provider.ngOnDestroy();
  }
}
