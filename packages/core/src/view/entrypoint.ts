/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {NgModuleFactory, NgModuleRef} from '../linker/ng_module_factory';
import {Type} from '../type';

import {initServicesIfNeeded} from './services';
import {NgModuleDefinitionFactory, ProviderOverride, Services} from './types';
import {resolveDefinition} from './util';

export function overrideProvider(override: ProviderOverride) {
  initServicesIfNeeded();
  return Services.overrideProvider(override);
}

export function clearProviderOverrides() {
  initServicesIfNeeded();
  return Services.clearProviderOverrides();
}

// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
export function createNgModuleFactory(
    ngModuleType: Type<any>, bootstrapComponents: Type<any>[],
    defFactory: NgModuleDefinitionFactory): NgModuleFactory<any> {
  return new NgModuleFactory_(ngModuleType, bootstrapComponents, defFactory);
}

class NgModuleFactory_ extends NgModuleFactory<any> {
  constructor(
      public readonly moduleType: Type<any>, private _bootstrapComponents: Type<any>[],
      private _ngModuleDefFactory: NgModuleDefinitionFactory) {
    // Attention: this ctor is called as top level function.
    // Putting any logic in here will destroy closure tree shaking!
    super();
  }

  create(parentInjector: Injector|null): NgModuleRef<any> {
    initServicesIfNeeded();
    const def = resolveDefinition(this._ngModuleDefFactory);
    return Services.createNgModuleRef(
        this.moduleType, parentInjector || Injector.NULL, this._bootstrapComponents, def);
  }
}
