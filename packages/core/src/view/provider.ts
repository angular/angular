/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, SimpleChange, SimpleChanges, WrappedValue} from '../change_detection/change_detection';
import {INJECTOR, Injector, resolveForwardRef} from '../di';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {Renderer2} from '../render/api';
import {isObservable} from '../util/lang';
import {stringify} from '../util/stringify';

import {createChangeDetectorRef, createInjector} from './refs';
import {asElementData, asProviderData, BindingDef, BindingFlags, DepDef, DepFlags, NodeDef, NodeFlags, OutputDef, OutputType, ProviderData, QueryValueType, Services, shouldCallLifecycleInitHook, ViewData, ViewFlags, ViewState} from './types';
import {calcBindingFlags, checkBinding, dispatchEvent, isComponentView, splitDepsDsl, splitMatchedQueriesDsl, tokenKey, viewParentEl} from './util';

const Renderer2TokenKey = tokenKey(Renderer2);
const ElementRefTokenKey = tokenKey(ElementRef);
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
const TemplateRefTokenKey = tokenKey(TemplateRef);
const ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
const InjectorRefTokenKey = tokenKey(Injector);
const INJECTORRefTokenKey = tokenKey(INJECTOR);

export function directiveDef(
    checkIndex: number, flags: NodeFlags, matchedQueries: null|[string | number, QueryValueType][],
    childCount: number, ctor: any, deps: ([DepFlags, any]|any)[],
    props?: null|{[name: string]: [number, string]},
    outputs?: null|{[name: string]: string}): NodeDef {
  const bindings: BindingDef[] = [];
  if (props) {
    for (let prop in props) {
      const [bindingIndex, nonMinifiedName] = props[prop];
      bindings[bindingIndex] = {
        flags: BindingFlags.TypeProperty,
        name: prop,
        nonMinifiedName,
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
  return _def(
      checkIndex, flags, matchedQueries, childCount, ctor, ctor, deps, bindings, outputDefs);
}

export function pipeDef(flags: NodeFlags, ctor: any, deps: ([DepFlags, any]|any)[]): NodeDef {
  flags |= NodeFlags.TypePipe;
  return _def(-1, flags, null, 0, ctor, ctor, deps);
}

export function providerDef(
    flags: NodeFlags, matchedQueries: null|[string | number, QueryValueType][], token: any,
    value: any, deps: ([DepFlags, any]|any)[]): NodeDef {
  return _def(-1, flags, matchedQueries, 0, token, value, deps);
}

export function _def(
    checkIndex: number, flags: NodeFlags, matchedQueriesDsl: [string|number, QueryValueType][]|null,
    childCount: number, token: any, value: any, deps: ([DepFlags, any]|any)[],
    bindings?: BindingDef[], outputs?: OutputDef[]): NodeDef {
  const {matchedQueries, references, matchedQueryIds} = splitMatchedQueriesDsl(matchedQueriesDsl);
  if (!outputs) {
    outputs = [];
  }
  if (!bindings) {
    bindings = [];
  }
  // Need to resolve forwardRefs as e.g. for `useValue` we
  // lowered the expression and then stopped evaluating it,
  // i.e. also didn't unwrap it.
  value = resolveForwardRef(value);

  const depDefs = splitDepsDsl(deps, stringify(token));

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
    ngContentIndex: -1,
    childCount,
    bindings,
    bindingFlags: calcBindingFlags(bindings),
    outputs,
    element: null,
    provider: {token, value, deps: depDefs},
    text: null,
    query: null,
    ngContent: null
  };
}

export function createProviderInstance(view: ViewData, def: NodeDef): any {
  return _createProviderInstance(view, def);
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
      compView.parent!, viewParentEl(compView)!, allowPrivateServices, def.provider!.value,
      def.provider!.deps);
}

export function createDirectiveInstance(view: ViewData, def: NodeDef): any {
  // components can see other private services, other directives can't.
  const allowPrivateServices = (def.flags & NodeFlags.Component) > 0;
  // directives are always eager and classes!
  const instance =
      createClass(view, def.parent!, allowPrivateServices, def.provider!.value, def.provider!.deps);
  if (def.outputs.length) {
    for (let i = 0; i < def.outputs.length; i++) {
      const output = def.outputs[i];
      const outputObservable = instance[output.propName!];
      if (isObservable(outputObservable)) {
        const subscription = outputObservable.subscribe(
            eventHandlerClosure(view, def.parent!.nodeIndex, output.eventName));
        view.disposables![def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
      } else {
        throw new Error(
            `@Output ${output.propName} not initialized in '${instance.constructor.name}'.`);
      }
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
  const providerData = asProviderData(view, def.nodeIndex);
  const directive = providerData.instance;
  let changed = false;
  let changes: SimpleChanges = undefined!;
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
  if ((def.flags & NodeFlags.OnInit) &&
      shouldCallLifecycleInitHook(view, ViewState.InitState_CallingOnInit, def.nodeIndex)) {
    directive.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    directive.ngDoCheck();
  }
  return changed;
}

export function checkAndUpdateDirectiveDynamic(
    view: ViewData, def: NodeDef, values: any[]): boolean {
  const providerData = asProviderData(view, def.nodeIndex);
  const directive = providerData.instance;
  let changed = false;
  let changes: SimpleChanges = undefined!;
  for (let i = 0; i < values.length; i++) {
    if (checkBinding(view, def, i, values[i])) {
      changed = true;
      changes = updateProp(view, providerData, def, i, values[i], changes);
    }
  }
  if (changes) {
    directive.ngOnChanges(changes);
  }
  if ((def.flags & NodeFlags.OnInit) &&
      shouldCallLifecycleInitHook(view, ViewState.InitState_CallingOnInit, def.nodeIndex)) {
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
  switch (def.flags & NodeFlags.Types) {
    case NodeFlags.TypeClassProvider:
      return createClass(
          view, def.parent!, allowPrivateServices, providerDef!.value, providerDef!.deps);
    case NodeFlags.TypeFactoryProvider:
      return callFactory(
          view, def.parent!, allowPrivateServices, providerDef!.value, providerDef!.deps);
    case NodeFlags.TypeUseExistingProvider:
      return resolveDep(view, def.parent!, allowPrivateServices, providerDef!.deps[0]);
    case NodeFlags.TypeValueProvider:
      return providerDef!.value;
  }
}

function createClass(
    view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  switch (len) {
    case 0:
      return new ctor();
    case 1:
      return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
    case 2:
      return new ctor(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]));
    case 3:
      return new ctor(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]),
          resolveDep(view, elDef, allowPrivateServices, deps[2]));
    default:
      const depValues = [];
      for (let i = 0; i < len; i++) {
        depValues.push(resolveDep(view, elDef, allowPrivateServices, deps[i]));
      }
      return new ctor(...depValues);
  }
}

function callFactory(
    view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, factory: any,
    deps: DepDef[]): any {
  const len = deps.length;
  switch (len) {
    case 0:
      return factory();
    case 1:
      return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
    case 2:
      return factory(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]));
    case 3:
      return factory(
          resolveDep(view, elDef, allowPrivateServices, deps[0]),
          resolveDep(view, elDef, allowPrivateServices, deps[1]),
          resolveDep(view, elDef, allowPrivateServices, deps[2]));
    default:
      const depValues = [];
      for (let i = 0; i < len; i++) {
        depValues.push(resolveDep(view, elDef, allowPrivateServices, deps[i]));
      }
      return factory(...depValues);
  }
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
    allowPrivateServices = !!(elDef && elDef.element!.componentView);
  }

  if (elDef && (depDef.flags & DepFlags.SkipSelf)) {
    allowPrivateServices = false;
    elDef = elDef.parent!;
  }

  let searchView: ViewData|null = view;
  while (searchView) {
    if (elDef) {
      switch (tokenKey) {
        case Renderer2TokenKey: {
          const compView = findCompView(searchView, elDef, allowPrivateServices);
          return compView.renderer;
        }
        case ElementRefTokenKey:
          return new ElementRef(asElementData(searchView, elDef.nodeIndex).renderElement);
        case ViewContainerRefTokenKey:
          return asElementData(searchView, elDef.nodeIndex).viewContainer;
        case TemplateRefTokenKey: {
          if (elDef.element!.template) {
            return asElementData(searchView, elDef.nodeIndex).template;
          }
          break;
        }
        case ChangeDetectorRefTokenKey: {
          let cdView = findCompView(searchView, elDef, allowPrivateServices);
          return createChangeDetectorRef(cdView);
        }
        case InjectorRefTokenKey:
        case INJECTORRefTokenKey:
          return createInjector(searchView, elDef);
        default:
          const providerDef =
              (allowPrivateServices ? elDef.element!.allProviders :
                                      elDef.element!.publicProviders)![tokenKey];
          if (providerDef) {
            let providerData = asProviderData(searchView, providerDef.nodeIndex);
            if (!providerData) {
              providerData = {instance: _createProviderInstance(searchView, providerDef)};
              searchView.nodes[providerDef.nodeIndex] = providerData as any;
            }
            return providerData.instance;
          }
      }
    }

    allowPrivateServices = isComponentView(searchView);
    elDef = viewParentEl(searchView)!;
    searchView = searchView.parent!;

    if (depDef.flags & DepFlags.Self) {
      searchView = null;
    }
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
    compView = asElementData(view, elDef.nodeIndex).componentView;
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
    const compView = asElementData(view, def.parent!.nodeIndex).componentView;
    if (compView.def.flags & ViewFlags.OnPush) {
      compView.state |= ViewState.ChecksEnabled;
    }
  }
  const binding = def.bindings[bindingIdx];
  const propName = binding.name!;
  // Note: This is still safe with Closure Compiler as
  // the user passed in the property name as an object has to `providerDef`,
  // so Closure Compiler will have renamed the property correctly already.
  providerData.instance[propName] = value;
  if (def.flags & NodeFlags.OnChanges) {
    changes = changes || {};
    const oldValue = WrappedValue.unwrap(view.oldValues[def.bindingIndex + bindingIdx]);
    const binding = def.bindings[bindingIdx];
    changes[binding.nonMinifiedName!] =
        new SimpleChange(oldValue, value, (view.state & ViewState.FirstCheck) !== 0);
  }
  view.oldValues[def.bindingIndex + bindingIdx] = value;
  return changes;
}

// This function calls the ngAfterContentCheck, ngAfterContentInit,
// ngAfterViewCheck, and ngAfterViewInit lifecycle hooks (depending on the node
// flags in lifecycle). Unlike ngDoCheck, ngOnChanges and ngOnInit, which are
// called during a pre-order traversal of the view tree (that is calling the
// parent hooks before the child hooks) these events are sent in using a
// post-order traversal of the tree (children before parents). This changes the
// meaning of initIndex in the view state. For ngOnInit, initIndex tracks the
// expected nodeIndex which a ngOnInit should be called. When sending
// ngAfterContentInit and ngAfterViewInit it is the expected count of
// ngAfterContentInit or ngAfterViewInit methods that have been called. This
// ensure that despite being called recursively or after picking up after an
// exception, the ngAfterContentInit or ngAfterViewInit will be called on the
// correct nodes. Consider for example, the following (where E is an element
// and D is a directive)
//  Tree:       pre-order index  post-order index
//    E1        0                6
//      E2      1                1
//       D3     2                0
//      E4      3                5
//       E5     4                4
//        E6    5                2
//        E7    6                3
// As can be seen, the post-order index has an unclear relationship to the
// pre-order index (postOrderIndex === preOrderIndex - parentCount +
// childCount). Since number of calls to ngAfterContentInit and ngAfterViewInit
// are stable (will be the same for the same view regardless of exceptions or
// recursion) we just need to count them which will roughly correspond to the
// post-order index (it skips elements and directives that do not have
// lifecycle hooks).
//
// For example, if an exception is raised in the E6.onAfterViewInit() the
// initIndex is left at 3 (by shouldCallLifecycleInitHook() which set it to
// initIndex + 1). When checkAndUpdateView() is called again D3, E2 and E6 will
// not have their ngAfterViewInit() called but, starting with E7, the rest of
// the view will begin getting ngAfterViewInit() called until a check and
// pass is complete.
//
// This algorthim also handles recursion. Consider if E4's ngAfterViewInit()
// indirectly calls E1's ChangeDetectorRef.detectChanges(). The expected
// initIndex is set to 6, the recusive checkAndUpdateView() starts walk again.
// D3, E2, E6, E7, E5 and E4 are skipped, ngAfterViewInit() is called on E1.
// When the recursion returns the initIndex will be 7 so E1 is skipped as it
// has already been called in the recursively called checkAnUpdateView().
export function callLifecycleHooksChildrenFirst(view: ViewData, lifecycles: NodeFlags) {
  if (!(view.def.nodeFlags & lifecycles)) {
    return;
  }
  const nodes = view.def.nodes;
  let initIndex = 0;
  for (let i = 0; i < nodes.length; i++) {
    const nodeDef = nodes[i];
    let parent = nodeDef.parent;
    if (!parent && nodeDef.flags & lifecycles) {
      // matching root node (e.g. a pipe)
      callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
    }
    if ((nodeDef.childFlags & lifecycles) === 0) {
      // no child matches one of the lifecycles
      i += nodeDef.childCount;
    }
    while (parent && (parent.flags & NodeFlags.TypeElement) &&
           i === parent.nodeIndex + parent.childCount) {
      // last child of an element
      if (parent.directChildFlags & lifecycles) {
        initIndex = callElementProvidersLifecycles(view, parent, lifecycles, initIndex);
      }
      parent = parent.parent;
    }
  }
}

function callElementProvidersLifecycles(
    view: ViewData, elDef: NodeDef, lifecycles: NodeFlags, initIndex: number): number {
  for (let i = elDef.nodeIndex + 1; i <= elDef.nodeIndex + elDef.childCount; i++) {
    const nodeDef = view.def.nodes[i];
    if (nodeDef.flags & lifecycles) {
      callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
    }
    // only visit direct children
    i += nodeDef.childCount;
  }
  return initIndex;
}

function callProviderLifecycles(
    view: ViewData, index: number, lifecycles: NodeFlags, initIndex: number) {
  const providerData = asProviderData(view, index);
  if (!providerData) {
    return;
  }
  const provider = providerData.instance;
  if (!provider) {
    return;
  }
  Services.setCurrentNode(view, index);
  if (lifecycles & NodeFlags.AfterContentInit &&
      shouldCallLifecycleInitHook(view, ViewState.InitState_CallingAfterContentInit, initIndex)) {
    provider.ngAfterContentInit();
  }
  if (lifecycles & NodeFlags.AfterContentChecked) {
    provider.ngAfterContentChecked();
  }
  if (lifecycles & NodeFlags.AfterViewInit &&
      shouldCallLifecycleInitHook(view, ViewState.InitState_CallingAfterViewInit, initIndex)) {
    provider.ngAfterViewInit();
  }
  if (lifecycles & NodeFlags.AfterViewChecked) {
    provider.ngAfterViewChecked();
  }
  if (lifecycles & NodeFlags.OnDestroy) {
    provider.ngOnDestroy();
  }
}
