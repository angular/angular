/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {EMPTY_ARRAY} from '../util/empty';
import {stringify} from '../util/stringify';
import {importProvidersFrom} from './provider_collection';
import {getNullInjector, R3Injector} from './r3_injector';
/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 */
export function createInjector(defType, parent = null, additionalProviders = null, name) {
  const injector = createInjectorWithoutInjectorInstances(
    defType,
    parent,
    additionalProviders,
    name,
  );
  injector.resolveInjectorInitializers();
  return injector;
}
/**
 * Creates a new injector without eagerly resolving its injector types. Can be used in places
 * where resolving the injector types immediately can lead to an infinite loop. The injector types
 * should be resolved at a later point by calling `_resolveInjectorDefTypes`.
 */
export function createInjectorWithoutInjectorInstances(
  defType,
  parent = null,
  additionalProviders = null,
  name,
  scopes = new Set(),
) {
  const providers = [additionalProviders || EMPTY_ARRAY, importProvidersFrom(defType)];
  name = name || (typeof defType === 'object' ? undefined : stringify(defType));
  return new R3Injector(providers, parent || getNullInjector(), name || null, scopes);
}
//# sourceMappingURL=create_injector.js.map
