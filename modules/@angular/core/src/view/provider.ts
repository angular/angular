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
import {BindingDef, BindingType, DepDef, DepFlags, DirectiveOutputDef, DisposableFn, NodeData, NodeDef, NodeFlags, NodeType, ProviderData, ProviderType, QueryBindingType, QueryDef, QueryValueType, RootData, Services, ViewData, ViewDefinition, ViewFlags, ViewState, asElementData, asProviderData} from './types';
import {checkAndUpdateBinding, dispatchEvent, isComponentView, tokenKey, viewParentElIndex} from './util';

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
  const bindings: BindingDef[] = [];
  if (props) {
    for (let prop in props) {
      const [bindingIndex, nonMinifiedName] = props[prop];
      bindings[bindingIndex] = {
        type: BindingType.DirectiveProperty,
        name: prop, nonMinifiedName,
        securityContext: undefined,
        suffix: undefined
      };
    }
  }
  const outputDefs: DirectiveOutputDef[] = [];
  if (outputs) {
    for (let propName in outputs) {
      outputDefs.push({propName, eventName: outputs[propName]});
    }
  }
  return _def(
      NodeType.Directive, flags, matchedQueries, childCount, ProviderType.Class, ctor, ctor, deps,
      bindings, outputDefs, component);
}

export function pipeDef(flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef {
  return _def(NodeType.Pipe, flags, null, 0, ProviderType.Class, ctor, ctor, deps);
}

export function providerDef(
    flags: NodeFlags, matchedQueries: [string, QueryValueType][], type: ProviderType, token: any,
    value: any, deps: ([DepFlags, any] | any)[]): NodeDef {
  return _def(NodeType.Provider, flags, matchedQueries, 0, type, token, value, deps);
}

export function _def(
    type: NodeType, flags: NodeFlags, matchedQueries: [string, QueryValueType][],
    childCount: number, providerType: ProviderType, token: any, value: any,
    deps: ([DepFlags, any] | any)[], bindings?: BindingDef[], outputs?: DirectiveOutputDef[],
    component?: () => ViewDefinition): NodeDef {
  const matchedQueryDefs: {[queryId: string]: QueryValueType} = {};
  if (matchedQueries) {
    matchedQueries.forEach(([queryId, valueType]) => { matchedQueryDefs[queryId] = valueType; });
  }
  if (!outputs) {
    outputs = [];
  }
  if (!bindings) {
    bindings = [];
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
    type,
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
    disposableCount: outputs.length,
    element: undefined,
    provider: {
      type: providerType,
      token,
      tokenKey: tokenKey(token), value,
      deps: depDefs, outputs, component
    },
    text: undefined,
    pureExpression: undefined,
    query: undefined,
    ngContent: undefined
  };
}

export function createProviderInstance(view: ViewData, def: NodeDef): any {
  return def.flags & NodeFlags.LazyProvider ? NOT_CREATED : _createProviderInstance(view, def);
}

export function createPipeInstance(view: ViewData, def: NodeDef): any {
  // deps are looked up from component.
  let compView = view;
  while (compView.parent && !isComponentView(compView)) {
    compView = compView.parent;
  }
  // pipes are always eager and classes!
  return createClass(
      compView.parent, compView.parentIndex, viewParentElIndex(compView), def.provider.value,
      def.provider.deps);
}

export function createDirectiveInstance(view: ViewData, def: NodeDef): any {
  const providerDef = def.provider;
  // directives are always eager and classes!
  const instance = createClass(view, def.index, def.parent, def.provider.value, def.provider.deps);
  if (providerDef.outputs.length) {
    for (let i = 0; i < providerDef.outputs.length; i++) {
      const output = providerDef.outputs[i];
      const subscription = instance[output.propName].subscribe(
          eventHandlerClosure(view, def.parent, output.eventName));
      view.disposables[def.disposableIndex + i] = subscription.unsubscribe.bind(subscription);
    }
  }
  return instance;
}

function eventHandlerClosure(view: ViewData, index: number, eventName: string) {
  return (event: any) => dispatchEvent(view, index, eventName, event);
}

export function checkAndUpdateDirectiveInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any) {
  const providerData = asProviderData(view, def.index);
  const directive = providerData.instance;
  let changes: SimpleChanges;
  // Note: fallthrough is intended!
  switch (def.bindings.length) {
    case 10:
      changes = checkAndUpdateProp(view, providerData, def, 9, v9, changes);
    case 9:
      changes = checkAndUpdateProp(view, providerData, def, 8, v8, changes);
    case 8:
      changes = checkAndUpdateProp(view, providerData, def, 7, v7, changes);
    case 7:
      changes = checkAndUpdateProp(view, providerData, def, 6, v6, changes);
    case 6:
      changes = checkAndUpdateProp(view, providerData, def, 5, v5, changes);
    case 5:
      changes = checkAndUpdateProp(view, providerData, def, 4, v4, changes);
    case 4:
      changes = checkAndUpdateProp(view, providerData, def, 3, v3, changes);
    case 3:
      changes = checkAndUpdateProp(view, providerData, def, 2, v2, changes);
    case 2:
      changes = checkAndUpdateProp(view, providerData, def, 1, v1, changes);
    case 1:
      changes = checkAndUpdateProp(view, providerData, def, 0, v0, changes);
  }
  if (changes) {
    directive.ngOnChanges(changes);
  }
  if ((view.state & ViewState.FirstCheck) && (def.flags & NodeFlags.OnInit)) {
    directive.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    directive.ngDoCheck();
  }
}

export function checkAndUpdateDirectiveDynamic(view: ViewData, def: NodeDef, values: any[]) {
  const providerData = asProviderData(view, def.index);
  const directive = providerData.instance;
  let changes: SimpleChanges;
  for (let i = 0; i < values.length; i++) {
    changes = checkAndUpdateProp(view, providerData, def, i, values[i], changes);
  }
  if (changes) {
    directive.ngOnChanges(changes);
  }
  if ((view.state & ViewState.FirstCheck) && (def.flags & NodeFlags.OnInit)) {
    directive.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    directive.ngDoCheck();
  }
}

function _createProviderInstance(view: ViewData, def: NodeDef): any {
  const providerDef = def.provider;
  let injectable: any;
  switch (providerDef.type) {
    case ProviderType.Class:
      injectable = createClass(view, def.index, def.parent, providerDef.value, providerDef.deps);
      break;
    case ProviderType.Factory:
      injectable = callFactory(view, def.index, def.parent, providerDef.value, providerDef.deps);
      break;
    case ProviderType.UseExisting:
      injectable = resolveDep(view, def.index, def.parent, providerDef.deps[0]);
      break;
    case ProviderType.Value:
      injectable = providerDef.value;
      break;
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
  if (depDef.flags & DepFlags.Value) {
    return depDef.token;
  }
  const startView = view;
  if (depDef.flags & DepFlags.Optional) {
    notFoundValue = null;
  }
  const tokenKey = depDef.tokenKey;

  if (depDef.flags & DepFlags.SkipSelf) {
    requestNodeIndex = null;
    elIndex = view.def.nodes[elIndex].parent;
    while (elIndex == null && view) {
      elIndex = viewParentElIndex(view);
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
            providerData.instance = _createProviderInstance(view, view.def.nodes[providerIndex]);
          }
          return providerData.instance;
        }
    }
    requestNodeIndex = null;
    elIndex = viewParentElIndex(view);
    view = view.parent;
  }
  return startView.root.injector.get(depDef.token, notFoundValue);
}

function checkAndUpdateProp(
    view: ViewData, providerData: ProviderData, def: NodeDef, bindingIdx: number, value: any,
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
    if (def.flags & NodeFlags.HasComponent) {
      const compView = providerData.componentView;
      if (compView.def.flags & ViewFlags.OnPush) {
        compView.state |= ViewState.ChecksEnabled;
      }
    }
    const binding = def.bindings[bindingIdx];
    const propName = binding.name;
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    providerData.instance[propName] = value;
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
    // We use the reverse child oreder to call providers of children first.
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
