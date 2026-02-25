/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractType} from '../interface/type';
import {InjectionToken} from '../di/injection_token';
import type {EnvironmentProviders} from '../di/interface/provider';
import {makeEnvironmentProviders} from '../di/provider_collection';

/**
 * Use shims for the `requestIdleCallback` and `cancelIdleCallback` functions for
 * environments where those functions are not available (e.g. Node.js and Safari).
 *
 * Note: we wrap the `requestIdleCallback` call into a function, so that it can be
 * overridden/mocked in test environment and picked up by the runtime code.
 */
type RequestIdle = typeof requestIdleCallback;

const _requestIdleCallback = () =>
  (typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: VoidFunction) => setTimeout(cb) as unknown as number
  ).bind(globalThis) as RequestIdle;

const _cancelIdleCallback = () =>
  (typeof requestIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout).bind(globalThis);

/**
 * Service which configures custom 'on idle' behavior for Angular features like `@defer`.
 *
 * @publicApi
 */
export interface IdleService {
  /**
   * Schedule `callback` to be executed when the current application or browser is considered idle.
   *
   * @returns an id which allows the scheduled callback to be cancelled before it executes.
   */
  requestOnIdle(callback: (deadline?: IdleDeadline) => void, options?: IdleRequestOptions): number;

  /**
   * Cancel a previously scheduled callback using the id associated with it.
   */
  cancelOnIdle(id: number): void;
}

export const IDLE_SERVICE = new InjectionToken<IdleService>(ngDevMode ? 'IDLE_SERVICE' : '', {
  providedIn: 'root',
  factory: () => new RequestIdleCallbackService(),
});

/**
 * Configures Angular to use the given DI token as its `IdleService`.
 *
 * The given token must be available for injection from the root injector, and the injected value
 * must implement the `IdleService` interface.
 *
 * @publicApi
 */
export function provideIdleServiceWith(
  useExisting: AbstractType<IdleService> | InjectionToken<IdleService>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: IDLE_SERVICE,
      useExisting,
    },
  ]);
}

/**
 * Default implementation of `IDLE_SERVICE` which uses `requestIdleCallback` when available or
 * `setTimeout` when not.
 */
class RequestIdleCallbackService implements IdleService {
  private readonly requestIdleCallback = _requestIdleCallback();
  private readonly cancelIdleCallback = _cancelIdleCallback();

  requestOnIdle(callback: (deadline?: IdleDeadline) => void, options?: IdleRequestOptions): number {
    return this.requestIdleCallback(callback, options);
  }

  cancelOnIdle(id: number): void {
    return this.cancelIdleCallback(id);
  }
}
