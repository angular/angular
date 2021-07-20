/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {Type} from '../interface/type';
import {ComponentFactory} from '../linker/component_factory';
import {NgModuleFactory, NgModuleRef} from '../linker/ng_module_factory';

import {initServicesIfNeeded} from './services';
import {NgModuleDefinition, NgModuleDefinitionFactory, NgModuleProviderDef, ProviderOverride, Services, ViewDefinition} from './types';
import {resolveDefinition} from './util';

export function overrideProvider(override: ProviderOverride) {
  initServicesIfNeeded();
  return Services.overrideProvider(override);
}

export function overrideComponentView(comp: Type<any>, componentFactory: ComponentFactory<any>) {
  initServicesIfNeeded();
  return Services.overrideComponentView(comp, componentFactory);
}

export function clearOverrides() {
  initServicesIfNeeded();
  return Services.clearOverrides();
}

// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
export function createNgModuleFactory(
    ngModuleType: Type<any>, bootstrapComponents: Type<any>[],
    defFactory: NgModuleDefinitionFactory): NgModuleFactory<any> {
  return new NgModuleFactory_(ngModuleType, bootstrapComponents, defFactory);
}

function cloneNgModuleDefinition(def: NgModuleDefinition): NgModuleDefinition {
  const providers = Array.from(def.providers);
  const modules = Array.from(def.modules);
  const providersByKey: {[tokenKey: string]: NgModuleProviderDef} = {};
  for (const key in def.providersByKey) {
    providersByKey[key] = def.providersByKey[key];
  }

  return {
    factory: def.factory,
    scope: def.scope,
    providers,
    modules,
    providersByKey,
  };
}

class NgModuleFactory_ extends NgModuleFactory<any> {
  constructor(
      public readonly moduleType: Type<any>, private _bootstrapComponents: Type<any>[],
      private _ngModuleDefFactory: NgModuleDefinitionFactory) {
    // Attention: this ctor is called as top level function.
    // Putting any logic in here will destroy closure tree shaking!
    super();
  }

  override create(parentInjector: Injector|null): NgModuleRef<any> {
    initServicesIfNeeded();
    // Clone the NgModuleDefinition so that any tree shakeable provider definition
    // added to this instance of the NgModuleRef doesn't affect the cached copy.
    // See https://github.com/angular/angular/issues/25018.
    const def = cloneNgModuleDefinition(resolveDefinition(this._ngModuleDefFactory));
    return Services.createNgModuleRef(
        this.moduleType, parentInjector || Injector.NULL, this._bootstrapComponents, def);
  }
}
