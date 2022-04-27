/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {flatten} from '../util/array_utils.js';
import {EMPTY_ARRAY} from '../util/empty.js';
import {stringify} from '../util/stringify.js';

import {Injector} from './injector.js';
import {StaticProvider} from './interface/provider.js';
import {importProvidersFrom} from './provider_collection.js';
import {getNullInjector, R3Injector} from './r3_injector.js';
import {InjectorScope} from './scope.js';

/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 *
 * @publicApi
 */
export function createInjector(
    defType: /* InjectorType<any> */ any, parent: Injector|null = null,
    additionalProviders: StaticProvider[]|null = null, name?: string): Injector {
  const injector =
      createInjectorWithoutInjectorInstances(defType, parent, additionalProviders, name);
  injector.resolveInjectorInitializers();
  return injector;
}

/**
 * Creates a new injector without eagerly resolving its injector types. Can be used in places
 * where resolving the injector types immediately can lead to an infinite loop. The injector types
 * should be resolved at a later point by calling `_resolveInjectorDefTypes`.
 */
export function createInjectorWithoutInjectorInstances(
    defType: /* InjectorType<any> */ any, parent: Injector|null = null,
    additionalProviders: StaticProvider[]|null = null, name?: string,
    scopes = new Set<InjectorScope>()): R3Injector {
  const providers = [
    ...flatten(additionalProviders || EMPTY_ARRAY),
    ...importProvidersFrom(defType),
  ];
  name = name || (typeof defType === 'object' ? undefined : stringify(defType));

  return new R3Injector(providers, parent || getNullInjector(), name || null, scopes);
}
