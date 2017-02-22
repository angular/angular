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
import {ViewEncapsulation} from '../metadata/view';
import {Renderer as RendererV1, RendererFactoryV2, RendererTypeV2, RendererV2} from '../render/api';

import {createChangeDetectorRef, createInjector, createRendererV1, createTemplateRef, createViewContainerRef} from './refs';
import {BindingDef, BindingType, DepDef, DepFlags, DisposableFn, NodeData, NodeDef, NodeFlags, NodeType, OutputDef, OutputType, ProviderData, ProviderType, QueryBindingType, QueryDef, QueryValueType, RootData, Services, ViewData, ViewDefinition, ViewFlags, ViewState, asElementData, asProviderData} from './types';
import {checkBinding, dispatchEvent, filterQueryId, isComponentView, splitMatchedQueriesDsl, tokenKey, viewParentEl} from './util';

const RendererV1TokenKey = tokenKey(RendererV1);
const RendererV2TokenKey = tokenKey(RendererV2);
const ElementRefTokenKey = tokenKey(ElementRef);
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
const TemplateRefTokenKey = tokenKey(TemplateRef);
const ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
const InjectorRefTokenKey = tokenKey(Injector);

const NOT_CREATED = new Object();

export function directiveDef(
    flags: NodeFlags, matchedQueries: [string | number, QueryValueType][], childCount: number,
    ctor: any, deps: ([DepFlags, any] | any)[], props?: {[name: string]: [number, string]},
    outputs?: {[name: string]: string}): NodeDef {
  const bindings: BindingDef[] = [];
  if (props) {
    for (let prop in props) {
      const [bindingIndex, nonMinifiedName] = props[prop];
      bindings[bindingIndex] = {
        type: BindingType.DirectiveProperty,
        name: prop, nonMinifiedName,
        ns: undefined,
        securityContext: undefined,
        suffix: undefined
      };
    }
  }
  const outputDefs: OutputDef[] = [];
  if (outputs) {
    for (let propName in outputs) {
      outputDefs.push(
          {type: OutputType.DirectiveOutput, propName, target: null, eventName: outputs[propName]});
    }
  }
  return _def(
      NodeType.Directive, flags, matchedQueries, childCount, ProviderType.Class, ctor, ctor, deps,
      bindings, outputDefs);
}

export function pipeDef(flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef {
  return _def(NodeType.Pipe, flags, null, 0, ProviderType.Class, ctor, ctor, deps);
}

export function providerDef(
    flags: NodeFlags, matchedQueries: [string | number, QueryValueType][], type: ProviderType,
    token: any, value: any, deps: ([DepFlags, any] | any)[]): NodeDef {
  return _def(NodeType.Provider, flags, matchedQueries, 0, type, token, value, deps);
}

export function _def(
    type: NodeType, flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    childCount: number, providerType: ProviderType, token: any, value: any,
    deps: ([DepFlags, any] | any)[], bindings?: BindingDef[], outputs?: OutputDef[]): NodeDef {
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
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

  return {
    type,
    // will bet set by the view definition
    index: undefined,
    reverseChildIndex: undefined,
    parent: undefined,
    renderParent: undefined,
    bindingIndex: undefined,
    outputIndex: undefined,
    // regular values
    flags,
    childFlags: 0,
    childMatchedQueries: 0, matchedQueries, matchedQueryIds, references,
    ngContentIndex: undefined, childCount, bindings, outputs,
    element: undefined,
    provider: {type: providerType, token, tokenKey: tokenKey(token), value, deps: depDefs},
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
  // pipes can see the private services of the component
  const allowPrivateServices = true;
  // pipes are always eager and classes!
  return createClass(
      compView.parent, viewParentEl(compView), allowPrivateServices, def.provider.value,
      def.provider.deps);
}

export function createDirectiveInstance(view: ViewData, def: NodeDef): any {
  // components can see other private services, other directives can't.
  const allowPrivateServices = (def.flags & NodeFlags.IsComponent) > 0;
  const providerDef = def.provider;
  // directives are always eager and classes!
  const instance =
      createClass(view, def.parent, allowPrivateServices, def.provider.value, def.provider.deps);
  if (def.outputs.length) {
    for (let i = 0; i < def.outputs.length; i++) {
      const output = def.outputs[i];
      const subscription = instance[output.propName].subscribe(
          eventHandlerClosure(view, def.parent.index, output.eventName));
      view.disposables[def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
    }
  }
  return instance;
}

function eventHandlerClosure(view: ViewData, index: number, eventName: string) {
  return (event: any) => dispatchEvent(view, index, eventName, event);
}

export function checkAndUpdateDirectiveInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any): boolean {
  const providerData = asProviderData(view, def.index);
  const directive = providerData.instance;
  let changed = false;
  let changes: SimpleChanges;
  const bindLen = def.bindings.length;
  if (bindLen > 0 && checkBinding(view, def, 0, v0)) {
    changed = true;
    changes = updateProp(view, providerData, def, 0, v0, changes);
  };
  if (bindLen > 1 && checkBinding(view, def, 1, v1)) {
    changed = true;
    changes = updateProp(view, providerData, def, 1, v1, changes);
  };
  if (bindLen > 2 && checkBinding(view, def, 2, v2)) {
    changed = true;
    changes = updateProp(view, providerData, def, 2, v2, changes);
  };
  if (bindLen > 3 && checkBinding(view, def, 3, v3)) {
    changed = true;
    changes = updateProp(view, providerData, def, 3, v3, changes);
  };
  if (bindLen > 4 && checkBinding(view, def, 4, v4)) {
    changed = true;
    changes = updateProp(view, providerData, def, 4, v4, changes);
  };
  if (bindLen > 5 && checkBinding(view, def, 5, v5)) {
    changed = true;
    changes = updateProp(view, providerData, def, 5, v5, changes);
  };
  if (bindLen > 6 && checkBinding(view, def, 6, v6)) {
    changed = true;
    changes = updateProp(view, providerData, def, 6, v6, changes);
  };
  if (bindLen > 7 && checkBinding(view, def, 7, v7)) {
    changed = true;
    changes = updateProp(view, providerData, def, 7, v7, changes);
  };
  if (bindLen > 8 && checkBinding(view, def, 8, v8)) {
    changed = true;
    changes = updateProp(view, providerData, def, 8, v8, changes);
  };
  if (bindLen > 9 && checkBinding(view, def, 9, v9)) {
    changed = true;
    changes = updateProp(view, providerData, def, 9, v9, changes);
  };
  if (changes) {
    directive.ngOnChanges(changes);
  }
  if ((view.state & ViewState.FirstCheck) && (def.flags & NodeFlags.OnInit)) {
    directive.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    directive.ngDoCheck();
  }
  return changed;
}

export function checkAndUpdateDirectiveDynamic(
    view: ViewData, def: NodeDef, values: any[]): boolean {
  const providerData = asProviderData(view, def.index);
  const directive = providerData.instance;
  let changed = false;
  let changes: SimpleChanges;
  for (let i = 0; i < values.length; i++) {
    if (checkBinding(view, def, i, values[i])) {
      changed = true;
      changes = updateProp(view, providerData, def, i, values[i], changes);
    }
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
  return changed;
}

function _createProviderInstance(view: ViewData, def: NodeDef): any {
  // private services can see other private services
  const allowPrivateServices = (def.flags & NodeFlags.PrivateProvider) > 0;
  const providerDef = def.provider;
  let injectable: any;
  switch (providerDef.type) {
    case ProviderType.Class:
      injectable =
          createClass(view, def.parent, allowPrivateServices, providerDef.value, providerDef.deps);
      break;
    case ProviderType.Factory:
      injectable =
          callFactory(view, def.parent, allowPrivateServices, providerDef.value, providerDef.deps);
      break;
    case ProviderType.UseExisting:
      injectable = resolveDep(view, def.parent, allowPrivateServices, providerDef.deps[0]);
      break;
    case ProviderType.Value:
      injectable = providerDef.value;
      break;
  }
  return injectable;
}

function createClass(
    view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = new ctor();
      break;
    case 1:
      injectable = new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
      break;
    case 2:
      injectable = new ctor(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]));
      break;
    case 3:
      injectable = new ctor(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]),
          resolveDep(view, elDef, allowPrivateServices, deps[2]));
      break;
    default:
      const depValues = new Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
      }
      injectable = new ctor(...depValues);
  }
  return injectable;
}

function callFactory(
    view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, factory: any,
    deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = factory();
      break;
    case 1:
      injectable = factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
      break;
    case 2:
      injectable = factory(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]));
      break;
    case 3:
      injectable = factory(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]),
          resolveDep(view, elDef, allowPrivateServices, deps[2]));
      break;
    default:
      const depValues = Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
      }
      injectable = factory(...depValues);
  }
  return injectable;
}

export function resolveDep(
    view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, depDef: DepDef,
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
    allowPrivateServices = false;
    elDef = elDef.parent;
  }

  while (view) {
    if (elDef) {
      switch (tokenKey) {
        case RendererV1TokenKey: {
          const compView = findCompView(view, elDef, allowPrivateServices);
          return createRendererV1(compView);
        }
        case RendererV2TokenKey: {
          const compView = findCompView(view, elDef, allowPrivateServices);
          return compView.renderer;
        }
        case ElementRefTokenKey:
          return new ElementRef(asElementData(view, elDef.index).renderElement);
        case ViewContainerRefTokenKey:
          return createViewContainerRef(view, elDef);
        case TemplateRefTokenKey: {
          if (elDef.element.template) {
            return createTemplateRef(view, elDef);
          }
          break;
        }
        case ChangeDetectorRefTokenKey: {
          let cdView = findCompView(view, elDef, allowPrivateServices);
          return createChangeDetectorRef(cdView);
        }
        case InjectorRefTokenKey:
          return createInjector(view, elDef);
        default:
          const providerDef =
              (allowPrivateServices ? elDef.element.allProviders :
                                      elDef.element.publicProviders)[tokenKey];
          if (providerDef) {
            const providerData = asProviderData(view, providerDef.index);
            if (providerData.instance === NOT_CREATED) {
              providerData.instance = _createProviderInstance(view, providerDef);
            }
            return providerData.instance;
          }
      }
    }
    allowPrivateServices = isComponentView(view);
    elDef = viewParentEl(view);
    view = view.parent;
  }
  return startView.root.injector.get(depDef.token, notFoundValue);
}

function findCompView(view: ViewData, elDef: NodeDef, allowPrivateServices: boolean) {
  let compView: ViewData;
  if (allowPrivateServices) {
    compView = asElementData(view, elDef.index).componentView;
  } else {
    compView = view;
    while (compView.parent && !isComponentView(compView)) {
      compView = compView.parent;
    }
  }
  return compView;
}

function updateProp(
    view: ViewData, providerData: ProviderData, def: NodeDef, bindingIdx: number, value: any,
    changes: SimpleChanges): SimpleChanges {
  if (def.flags & NodeFlags.IsComponent) {
    const compView = asElementData(view, def.parent.index).componentView;
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
  if (def.flags & NodeFlags.OnChanges) {
    changes = changes || {};
    const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
    const binding = def.bindings[bindingIdx];
    changes[binding.nonMinifiedName] =
        new SimpleChange(oldValue, value, (view.state & ViewState.FirstCheck) !== 0);
  }
  view.oldValues[def.bindingIndex + bindingIdx] = value;
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
