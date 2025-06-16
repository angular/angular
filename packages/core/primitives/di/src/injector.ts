/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from './injection_token';
import {NotFound, NOT_FOUND} from './not_found';

export interface Injector {
  retrieve<T>(token: InjectionToken<T>, options?: unknown): T | NotFound;
}

/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - `null`: `inject` can be called but there is no injector (limp-mode).
 * - Injector instance: Use the injector for resolution.
 */
let _currentInjector: Injector | undefined | null = undefined;

export function getCurrentInjector(): Injector | undefined | null {
  return _currentInjector;
}

export function setCurrentInjector(
  injector: Injector | null | undefined,
): Injector | undefined | null {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}

export function inject<T>(token: InjectionToken<T>, options?: unknown): T | NotFound {
  const currentInjector = getCurrentInjector();
  if (!currentInjector) {
    return NOT_FOUND;
  }
  return currentInjector.retrieve(token, options);
}
