/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractType, InjectionToken, Type} from '@angular/core';
import {isValueProvider, providerToFactory, TOKEN_NOT_FOUND} from '@angular/core/src/di/r3_injector';

/**
 * Name of the field that would be monkey-patched onto a provided local cache storage to keep token
 * values retrieved from the global registry.
 */
const LOCAL_CACHE_KEY = '__NG_LOCAL_TOKEN_CACHE__';

type AnyInjectionToken = Type<any>|AbstractType<any>|InjectionToken<any>;

/**
 * Keeps the reference to a Map that represents a global token registry.
 */
let _globalTokenRegistry: Map<AnyInjectionToken, any /* factoryFn */> = new Map();

export function addTokenToGlobalRegistry(token: AnyInjectionToken, provider: any) {
  // Value providers (`useValue`) are also converted into factory functions to simplify the logic on
  // consumer side.
  const factoryFn =
      isValueProvider(provider) ? (() => provider.useValue) : providerToFactory(provider);
  _globalTokenRegistry.set(token, factoryFn);
}

export function clearGlobalTokenRegistry(): void {
  _globalTokenRegistry.clear();
}

/**
 * Actual implementation of the global registry lookup that also caches retrieved result
 * (if a token was found in the registry).
 */
export function retrieveTokenFromGlobalRegistry(
    token: AnyInjectionToken,
    localCache: {[LOCAL_CACHE_KEY]: Map<AnyInjectionToken, any /* value */>}) {
  if (!_globalTokenRegistry.has(token)) {
    return TOKEN_NOT_FOUND;
  }
  let cache = localCache[LOCAL_CACHE_KEY];
  if (!cache) {
    cache = localCache[LOCAL_CACHE_KEY] = new Map();
  }
  if (!cache.has(token)) {
    const factoryFn = _globalTokenRegistry.get(token);
    const value = factoryFn();
    cache.set(token, value);
    return value;
  } else {
    return cache.get(token);
  }
}