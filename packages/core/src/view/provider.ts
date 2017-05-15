/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, SimpleChange, SimpleChanges, WrappedValue} from '../change_detection/change_detection';
import {Injector} from '../di';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {Renderer as RendererV1, Renderer2} from '../render/api';

import {createChangeDetectorRef, createInjector, createRendererV1} from './refs';
import {BindingDef, BindingFlags, DepDef, DepFlags, NodeDef, NodeFlags, OutputDef, OutputType, ProviderData, QueryValueType, Services, ViewData, ViewFlags, ViewState, asElementData, asProviderData} from './types';
import {calcBindingFlags, checkBinding, dispatchEvent, isComponentView, splitDepsDsl, splitMatchedQueriesDsl, tokenKey, viewParentEl} from './util';

const RendererV1TokenKey = tokenKey(RendererV1);
const Renderer2TokenKey = tokenKey(Renderer2);
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
        flags: BindingFlags.TypeProperty,
        name: prop, nonMinifiedName,
        ns: null,
        securityContext: null,
        suffix: null
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
  flags |= NodeFlags.TypeDirective;
  return _def(flags, matchedQueries, childCount, ctor, ctor, deps, bindings, outputDefs);
}

export function pipeDef(flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef {
  flags |= NodeFlags.TypePipe;
  return _def(flags, null, 0, ctor, ctor, deps);
}

export function providerDef(
    flags: NodeFlags, matchedQueries: [string | number, QueryValueType][], token: any, value: any,
    deps: ([DepFlags, any] | any)[]): NodeDef {
  return _def(flags, matchedQueries, 0, token, value, deps);
}

export function _def(
    flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][] | null,
    childCount: number, token: any, value: any, deps: ([DepFlags, any] | any)[],
    bindings?: BindingDef[], outputs?: OutputDef[]): NodeDef {
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  if (!outputs) {
    outputs = [];
  }
  if (!bindings) {
    bindings = [];
  }

  const depDefs = splitDepsDsl(deps);

  return {
    // will bet set by the view definition
    index: -1,
    parent: null,
    renderParent: null,
    bindingIndex: -1,
    outputIndex: -1,
    // regular values
    flags,
    childFlags: 0,
    directChildFlags: 0,
    childMatchedQueries: 0, matchedQueries, matchedQueryIds, references,
    ngContentIndex: -1, childCount, bindings,
    bindingFlags: calcBindingFlags(bindings), outputs,
    element: null,
    provider: {token, value, deps: depDefs},
    text: null,
    query: null,
    ngContent: null
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
      compView.parent !, viewParentEl(compView) !, allowPrivateServices, def.provider !.value,
      def.provider !.deps);
}

export function createDirectiveInstance(view: ViewData, def: NodeDef): any {
  // components can see other private services, other directives can't.
  const allowPrivateServices = (def.flags & NodeFlags.Component) > 0;
  // directives are always eager and classes!
  const instance = createClass(
      view, def.parent !, allowPrivateServices, def.provider !.value, def.provider !.deps);
  if (def.outputs.length) {
    for (let i = 0; i < def.outputs.length; i++) {
      const output = def.outputs[i];
      const subscription = instance[output.propName !].subscribe(
          eventHandlerClosure(view, def.parent !.index, output.eventName));
      view.disposables ![def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
    }
  }
  return instance;
}

function eventHandlerClosure(view: ViewData, index: number, eventName: string) {
  return (event: any) => {
    try {
      return dispatchEvent(view, index, eventName, event);
    } catch (e) {
      // Attention: Don't rethrow, as it would cancel Observable subscriptions!
      view.root.errorHandler.handleError(e);
    }
  }
}

export function checkAndUpdateDirectiveInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any): boolean {
  const providerData = asProviderData(view, def.index);
  const directive = providerData.instance;
  let changed = false;
  let changes: SimpleChanges = undefined !;
  const bindLen = def.bindings.length;
  if (bindLen > 0 && checkBinding(view, def, 0, v0)) {
    changed = true;
    changes = updateProp(view, providerData, def, 0, v0, changes);
  }
  if (bindLen > 1 && checkBinding(view, def, 1, v1)) {
    changed = true;
    changes = updateProp(view, providerData, def, 1, v1, changes);
  }
  if (bindLen > 2 && checkBinding(view, def, 2, v2)) {
    changed = true;
    changes = updateProp(view, providerData, def, 2, v2, changes);
  }
  if (bindLen > 3 && checkBinding(view, def, 3, v3)) {
    changed = true;
    changes = updateProp(view, providerData, def, 3, v3, changes);
  }
  if (bindLen > 4 && checkBinding(view, def, 4, v4)) {
    changed = true;
    changes = updateProp(view, providerData, def, 4, v4, changes);
  }
  if (bindLen > 5 && checkBinding(view, def, 5, v5)) {
    changed = true;
    changes = updateProp(view, providerData, def, 5, v5, changes);
  }
  if (bindLen > 6 && checkBinding(view, def, 6, v6)) {
    changed = true;
    changes = updateProp(view, providerData, def, 6, v6, changes);
  }
  if (bindLen > 7 && checkBinding(view, def, 7, v7)) {
    changed = true;
    changes = updateProp(view, providerData, def, 7, v7, changes);
  }
  if (bindLen > 8 && checkBinding(view, def, 8, v8)) {
    changed = true;
    changes = updateProp(view, providerData, def, 8, v8, changes);
  }
  if (bindLen > 9 && checkBinding(view, def, 9, v9)) {
    changed = true;
    changes = updateProp(view, providerData, def, 9, v9, changes);
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

export function checkAndUpdateDirectiveDynamic(
    view: ViewData, def: NodeDef, values: any[]): boolean {
  const providerData = asProviderData(view, def.index);
  const directive = providerData.instance;
  let changed = false;
  let changes: SimpleChanges = undefined !;
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
  switch (def.flags & NodeFlags.Types) {
    case NodeFlags.TypeClassProvider:
      injectable = createClass(
          view, def.parent !, allowPrivateServices, providerDef !.value, providerDef !.deps);
      break;
    case NodeFlags.TypeFactoryProvider:
      injectable = callFactory(
          view, def.parent !, allowPrivateServices, providerDef !.value, providerDef !.deps);
      break;
    case NodeFlags.TypeUseExistingProvider:
      injectable = resolveDep(view, def.parent !, allowPrivateServices, providerDef !.deps[0]);
      break;
    case NodeFlags.TypeValueProvider:
      injectable = providerDef !.value;
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

// This default value is when checking the hierarchy for a token.
//
// It means both:
// - the token is not provided by the current injector,
// - only the element injectors should be checked (ie do not check module injectors
//
//          mod1
//         /
//       el1   mod2
//         \  /
//         el2
//
// When requesting el2.injector.get(token), we should check in the following order and return the
// first found value:
// - el2.injector.get(token, default)
// - el1.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) -> do not check the module
// - mod2.injector.get(token, default)
export const NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};

export function resolveDep(
    view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, depDef: DepDef,
    notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
  if (depDef.flags & DepFlags.Value) {
    return depDef.token;
  }
  const startView = view;
  if (depDef.flags & DepFlags.Optional) {
    notFoundValue = null;
  }
  const tokenKey = depDef.tokenKey;

  if (tokenKey === ChangeDetectorRefTokenKey) {
    // directives on the same element as a component should be able to control the change detector
    // of that component as well.
    allowPrivateServices = !!(elDef && elDef.element !.componentView);
  }

  if (elDef && (depDef.flags & DepFlags.SkipSelf)) {
    allowPrivateServices = false;
    elDef = elDef.parent !;
  }

  while (view) {
    if (elDef) {
      switch (tokenKey) {
        case RendererV1TokenKey: {
          const compView = findCompView(view, elDef, allowPrivateServices);
          return createRendererV1(compView);
        }
        case Renderer2TokenKey: {
          const compView = findCompView(view, elDef, allowPrivateServices);
          return compView.renderer;
        }
        case ElementRefTokenKey:
          return new ElementRef(asElementData(view, elDef.index).renderElement);
        case ViewContainerRefTokenKey:
          return asElementData(view, elDef.index).viewContainer;
        case TemplateRefTokenKey: {
          if (elDef.element !.template) {
            return asElementData(view, elDef.index).template;
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
              (allowPrivateServices ? elDef.element !.allProviders :
                                      elDef.element !.publicProviders) ![tokenKey];
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
    elDef = viewParentEl(view) !;
    view = view.parent !;
  }

  const value = startView.root.injector.get(depDef.token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);

  if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
      notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
    // Return the value from the root element injector when
    // - it provides it
    //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
    // - the module injector should not be checked
    //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
    return value;
  }

  return startView.root.ngModule.injector.get(depDef.token, notFoundValue);
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
  if (def.flags & NodeFlags.Component) {
    const compView = asElementData(view, def.parent !.index).componentView;
    if (compView.def.flags & ViewFlags.OnPush) {
      compView.state |= ViewState.ChecksEnabled;
    }
  }
  const binding = def.bindings[bindingIdx];
  const propName = binding.name !;
  // Note: This is still safe with Closure Compiler as
  // the user passed in the property name as an object has to `providerDef`,
  // so Closure Compiler will have renamed the property correctly already.
  providerData.instance[propName] = value;
  if (def.flags & NodeFlags.OnChanges) {
    changes = changes || {};
    let oldValue = view.oldValues[def.bindingIndex + bindingIdx];
    if (oldValue instanceof WrappedValue) {
      oldValue = oldValue.wrapped;
    }
    const binding = def.bindings[bindingIdx];
    changes[binding.nonMinifiedName !] =
        new SimpleChange(oldValue, value, (view.state & ViewState.FirstCheck) !== 0);
  }
  view.oldValues[def.bindingIndex + bindingIdx] = value;
  return changes;
}

export function callLifecycleHooksChildrenFirst(view: ViewData, lifecycles: NodeFlags) {
  if (!(view.def.nodeFlags & lifecycles)) {
    return;
  }
  const nodes = view.def.nodes;
  for (let i = 0; i < nodes.length; i++) {
    const nodeDef = nodes[i];
    let parent = nodeDef.parent;
    if (!parent && nodeDef.flags & lifecycles) {
      // matching root node (e.g. a pipe)
      callProviderLifecycles(view, i, nodeDef.flags & lifecycles);
    }
    if ((nodeDef.childFlags & lifecycles) === 0) {
      // no child matches one of the lifecycles
      i += nodeDef.childCount;
    }
    while (parent && (parent.flags & NodeFlags.TypeElement) &&
           i === parent.index + parent.childCount) {
      // last child of an element
      if (parent.directChildFlags & lifecycles) {
        callElementProvidersLifecycles(view, parent, lifecycles);
      }
      parent = parent.parent;
    }
  }
}

function callElementProvidersLifecycles(view: ViewData, elDef: NodeDef, lifecycles: NodeFlags) {
  for (let i = elDef.index + 1; i <= elDef.index + elDef.childCount; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & lifecycles) {
      callProviderLifecycles(view, i, nodeDef.flags & lifecycles);
    }
    // only visit direct children
    i += nodeDef.childCount;
  }
}

function callProviderLifecycles(view: ViewData, index: number, lifecycles: NodeFlags) {
  const provider = asProviderData(view, index).instance;
  if (provider === NOT_CREATED) {
    return;
  }
  Services.setCurrentNode(view, index);
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
