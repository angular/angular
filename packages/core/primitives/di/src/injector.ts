/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Constructor, InjectionToken} from './injection_token';
import {NotFound} from './not_found';
import {get, make, set, Store} from './store';

export interface Injector {
  retrieve<T>(token: InjectionToken<T>, options?: unknown): T | NotFound;
}

/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - `null`: `inject` can be called but there is no injector (limp-mode).
 * - Injector instance: Use the injector for resolution.
 */
const _currentInjector: Store<Injector | undefined | null> = make(undefined);

export function getCurrentInjector(): Injector | undefined | null {
  return get(_currentInjector);
}

export function setCurrentInjector(
  injector: Injector | null | undefined,
): Injector | undefined | null {
  return set(_currentInjector, injector);
}

export function inject<T>(token: InjectionToken<T> | Constructor<T>): T;
export function inject<T>(
  token: InjectionToken<T> | Constructor<T>,
  options?: unknown,
): T | NotFound {
  const currentInjector = getCurrentInjector();
  if (!currentInjector) {
    throw new Error('Current injector is not set.');
  }
  if (!(token as InjectionToken<T>).ɵprov) {
    throw new Error('Token is not an injectable');
  }
  return currentInjector.retrieve(token as InjectionToken<T>, options);
}
