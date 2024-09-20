/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EMPTY_ARRAY} from '../util/empty';
import {stringify} from '../util/stringify';

import type {Injector} from './injector';
import type {Provider, StaticProvider} from './interface/provider';
import {importProvidersFrom} from './provider_collection';
import {getNullInjector, R3Injector} from './r3_injector';
import {InjectorScope} from './scope';

/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 */
export function createInjector(
  defType: /* InjectorType<any> */ any,
  parent: Injector | null = null,
  additionalProviders: Array<Provider | StaticProvider> | null = null,
  name?: string,
): Injector {
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
  defType: /* InjectorType<any> */ any,
  parent: Injector | null = null,
  additionalProviders: Array<Provider | StaticProvider> | null = null,
  name?: string,
  scopes = new Set<InjectorScope>(),
): R3Injector {
  const providers = [additionalProviders || EMPTY_ARRAY, importProvidersFrom(defType)];
  name = name || (typeof defType === 'object' ? undefined : stringify(defType));

  return new R3Injector(providers, parent || getNullInjector(), name || null, scopes);
}
