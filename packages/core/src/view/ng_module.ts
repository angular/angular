/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolveForwardRef} from '../di/forward_ref';
import {Injector} from '../di/injector';
import {NgModuleRef} from '../linker/ng_module_factory';
import {stringify} from '../util';

import {DepDef, DepFlags, NgModuleData, NgModuleDefinition, NgModuleProviderDef, NodeFlags} from './types';
import {splitDepsDsl, tokenKey} from './util';

const UNDEFINED_VALUE = new Object();

const InjectorRefTokenKey = tokenKey(Injector);
const NgModuleRefTokenKey = tokenKey(NgModuleRef);

export function moduleProvideDef(
    flags: NodeFlags, token: any, value: any,
    deps: ([DepFlags, any] | any)[]): NgModuleProviderDef {
  // Need to resolve forwardRefs as e.g. for `useValue` we
  // lowered the expression and then stopped evaluating it,
  // i.e. also didn't unwrap it.
  value = resolveForwardRef(value);
  const depDefs = splitDepsDsl(deps, stringify(token));
  return {
    // will bet set by the module definition
    index: -1,
    deps: depDefs, flags, token, value
  };
}

export function moduleDef(providers: NgModuleProviderDef[]): NgModuleDefinition {
  const providersByKey: {[key: string]: NgModuleProviderDef} = {};
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    provider.index = i;
    providersByKey[tokenKey(provider.token)] = provider;
  }
  return {
    // Will be filled later...
    factory: null,
    providersByKey,
    providers
  };
}

export function initNgModule(data: NgModuleData) {
  const def = data._def;
  const providers = data._providers = new Array(def.providers.length);
  for (let i = 0; i < def.providers.length; i++) {
    const provDef = def.providers[i];
    if (!(provDef.flags & NodeFlags.LazyProvider)) {
      providers[i] = _createProviderInstance(data, provDef);
    }
  }
}

export function resolveNgModuleDep(
    data: NgModuleData, depDef: DepDef, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
  if (depDef.flags & DepFlags.Value) {
    return depDef.token;
  }
  if (depDef.flags & DepFlags.Optional) {
    notFoundValue = null;
  }
  if (depDef.flags & DepFlags.SkipSelf) {
    return data._parent.get(depDef.token, notFoundValue);
  }
  const tokenKey = depDef.tokenKey;
  switch (tokenKey) {
    case InjectorRefTokenKey:
    case NgModuleRefTokenKey:
      return data;
  }
  const providerDef = data._def.providersByKey[tokenKey];
  if (providerDef) {
    let providerInstance = data._providers[providerDef.index];
    if (providerInstance === undefined) {
      providerInstance = data._providers[providerDef.index] =
          _createProviderInstance(data, providerDef);
    }
    return providerInstance === UNDEFINED_VALUE ? undefined : providerInstance;
  }
  return data._parent.get(depDef.token, notFoundValue);
}


function _createProviderInstance(ngModule: NgModuleData, providerDef: NgModuleProviderDef): any {
  let injectable: any;
  switch (providerDef.flags & NodeFlags.Types) {
    case NodeFlags.TypeClassProvider:
      injectable = _createClass(ngModule, providerDef.value, providerDef.deps);
      break;
    case NodeFlags.TypeFactoryProvider:
      injectable = _callFactory(ngModule, providerDef.value, providerDef.deps);
      break;
    case NodeFlags.TypeUseExistingProvider:
      injectable = resolveNgModuleDep(ngModule, providerDef.deps[0]);
      break;
    case NodeFlags.TypeValueProvider:
      injectable = providerDef.value;
      break;
  }
  return injectable === undefined ? UNDEFINED_VALUE : injectable;
}

function _createClass(ngModule: NgModuleData, ctor: any, deps: DepDef[]): any {
  const len = deps.length;
  switch (len) {
    case 0:
      return new ctor();
    case 1:
      return new ctor(resolveNgModuleDep(ngModule, deps[0]));
    case 2:
      return new ctor(resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]));
    case 3:
      return new ctor(
          resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]),
          resolveNgModuleDep(ngModule, deps[2]));
    default:
      const depValues = new Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveNgModuleDep(ngModule, deps[i]);
      }
      return new ctor(...depValues);
  }
}

function _callFactory(ngModule: NgModuleData, factory: any, deps: DepDef[]): any {
  const len = deps.length;
  switch (len) {
    case 0:
      return factory();
    case 1:
      return factory(resolveNgModuleDep(ngModule, deps[0]));
    case 2:
      return factory(resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]));
    case 3:
      return factory(
          resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]),
          resolveNgModuleDep(ngModule, deps[2]));
    default:
      const depValues = Array(len);
      for (let i = 0; i < len; i++) {
        depValues[i] = resolveNgModuleDep(ngModule, deps[i]);
      }
      return factory(...depValues);
  }
}

export function callNgModuleLifecycle(ngModule: NgModuleData, lifecycles: NodeFlags) {
  const def = ngModule._def;
  for (let i = 0; i < def.providers.length; i++) {
    const provDef = def.providers[i];
    if (provDef.flags & NodeFlags.OnDestroy) {
      const instance = ngModule._providers[i];
      if (instance && instance !== UNDEFINED_VALUE) {
        instance.ngOnDestroy();
      }
    }
  }
}
