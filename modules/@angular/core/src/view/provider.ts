/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChange, SimpleChanges} from '../change_detection/change_detection';
import {Injector} from '../di';
import {stringify} from '../facade/lang';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {Renderer} from '../render/api';

import {BindingDef, BindingType, DepDef, DepFlags, NodeData, NodeDef, NodeFlags, NodeType, Services, ViewData, ViewDefinition, ViewFlags} from './types';
import {checkAndUpdateBinding, checkAndUpdateBindingWithChange, setBindingDebugInfo} from './util';

const _tokenKeyCache = new Map<any, string>();

const RendererTokenKey = tokenKey(Renderer);
const ElementRefTokenKey = tokenKey(ElementRef);
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
const TemplateRefTokenKey = tokenKey(TemplateRef);

export function providerDef(
    flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[],
    props?: {[name: string]: [number, string]}, component?: () => ViewDefinition): NodeDef {
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
    bindingIndex: undefined,
    providerIndices: undefined,
    // regular values
    flags,
    childCount: 0, bindings,
    element: undefined,
    provider: {
      tokenKey: tokenKey(ctor),
      ctor,
      deps: depDefs,
    },
    text: undefined, component,
    template: undefined
  };
}

export function tokenKey(token: any): string {
  let key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + '_' + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}

export function createProvider(view: ViewData, def: NodeDef, componentView: ViewData): NodeData {
  const providerDef = def.provider;
  return {
    renderNode: undefined,
    provider: createInstance(view, def.parent, providerDef.ctor, providerDef.deps),
    embeddedViews: undefined, componentView
  };
}

export function checkAndUpdateProviderInline(
    view: ViewData, def: NodeDef, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any, v8: any, v9: any) {
  const provider = view.nodes[def.index].provider;
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
  if (view.firstChange && (def.flags & NodeFlags.OnInit)) {
    provider.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    provider.ngDoCheck();
  }
}

export function checkAndUpdateProviderDynamic(
    view: ViewData, index: number, def: NodeDef, values: any[]) {
  const provider = view.nodes[def.index].provider;
  let changes: SimpleChanges;
  for (let i = 0; i < values.length; i++) {
    changes = checkAndUpdateProp(view, provider, def, i, values[i], changes);
  }
  if (changes) {
    provider.ngOnChanges(changes);
  }
  if (view.firstChange && (def.flags & NodeFlags.OnInit)) {
    provider.ngOnInit();
  }
  if (def.flags & NodeFlags.DoCheck) {
    provider.ngDoCheck();
  }
}

function createInstance(view: ViewData, elIndex: number, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  let injectable: any;
  switch (len) {
    case 0:
      injectable = new ctor();
      break;
    case 1:
      injectable = new ctor(resolveDep(view, elIndex, deps[0]));
      break;
    case 2:
      injectable = new ctor(resolveDep(view, elIndex, deps[0]), resolveDep(view, elIndex, deps[1]));
      break;
    case 3:
      injectable = new ctor(
          resolveDep(view, elIndex, deps[0]), resolveDep(view, elIndex, deps[1]),
          resolveDep(view, elIndex, deps[2]));
      break;
    default:
      const depValues = new Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elIndex, deps[i]);
      }
      injectable = new ctor(...depValues);
  }
  return injectable;
}

export function resolveDep(
    view: ViewData, elIndex: number, depDef: DepDef,
    notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
  const tokenKey = depDef.tokenKey;

  if (depDef.flags & DepFlags.SkipSelf) {
    const elDef = view.def.nodes[elIndex];
    if (elDef.parent != null) {
      elIndex = elDef.parent;
    } else {
      elIndex = view.parentIndex;
      view = view.parent;
    }
  }

  while (view) {
    const elDef = view.def.nodes[elIndex];
    switch (tokenKey) {
      case RendererTokenKey:
        if (view.renderer) {
          return view.renderer;
        } else {
          return Injector.NULL.get(depDef.token, notFoundValue);
        }
      case ElementRefTokenKey:
        return new ElementRef(view.nodes[elIndex].renderNode);
      case ViewContainerRefTokenKey:
        return view.services.createViewContainerRef(view.nodes[elIndex]);
      case TemplateRefTokenKey:
        return view.services.createTemplateRef(view, elDef);
      default:
        const providerIndex = elDef.providerIndices[tokenKey];
        if (providerIndex != null) {
          return view.nodes[providerIndex].provider;
        }
    }
    elIndex = view.parentIndex;
    view = view.parent;
  }
  return Injector.NULL.get(depDef.token, notFoundValue);
}

function checkAndUpdateProp(
    view: ViewData, provider: any, def: NodeDef, bindingIdx: number, value: any,
    changes: SimpleChanges): SimpleChanges {
  let change: SimpleChange;
  let changed: boolean;
  if (def.flags & NodeFlags.OnChanges) {
    change = checkAndUpdateBindingWithChange(view, def, bindingIdx, value);
    changed = !!change;
  } else {
    changed = checkAndUpdateBinding(view, def, bindingIdx, value);
  }
  if (changed) {
    const binding = def.bindings[bindingIdx];
    const propName = binding.name;
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    provider[propName] = value;

    if (view.def.flags & ViewFlags.LogBindingUpdate) {
      setBindingDebugInfo(view.renderer, view.nodes[def.parent].renderNode, name, value);
    }
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
      callProviderLifecycles(view.nodes[nodeIndex].provider, nodeDef.flags & lifecycles);
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
