/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector} from '../di/r3_injector';
import {Injector} from '../di/injector';
import {runInInjectionContext} from '../di/contextual';
import {isPromise} from '../util/lang';
import {NgZone} from '../zone';
import {DeferDependencyLoadResult, DependencyResolverFn, TDeferBlockDetails} from './interfaces';
import {
  DEFER_BLOCK_RETRY_HANDLER,
  DeferBlockRetryContext,
  DeferBlockRetryHandler,
} from './retry_handler';

/**
 * Enables retry loading for a defer block.
 *
 * @param tDetails Static information about the defer block.
 * @param maxRetryCount Number of additional dependency-loading rounds after a failure.
 *
 * @codeGenApi
 */
export function ɵɵdeferEnableRetry(tDetails: TDeferBlockDetails, maxRetryCount: number): void {
  tDetails.maxRetryCount = maxRetryCount;
  tDetails.retryLoadingFn = loadDeferDependenciesWithRetry;
}

/**
 * Calls the dependency function again after each failed round, up to `maxRetryCount` times.
 */
async function loadDeferDependenciesWithRetry(
  dependenciesFn: DependencyResolverFn,
  injector: Injector,
  maxRetryCount: number,
  pauseTask: () => VoidFunction,
): Promise<DeferDependencyLoadResult[]> {
  const environmentInjector = injector.get(EnvironmentInjector);
  const retryHandler = injector.get(DEFER_BLOCK_RETRY_HANDLER, null, {optional: true});
  let results: DeferDependencyLoadResult[] = await Promise.allSettled(dependenciesFn());

  for (let attempt = 1; attempt <= maxRetryCount; attempt++) {
    const failure = results.find((r) => r.status === 'rejected');
    // Stop on success or after the injector is destroyed.
    if (failure?.status !== 'rejected' || environmentInjector.destroyed) {
      break;
    }

    if (retryHandler !== null) {
      const resumeTask = pauseTask();
      try {
        await invokeDeferBlockRetryHandler(retryHandler, environmentInjector, {
          attempt,
          maxRetryCount,
          error: failure.reason,
        });
      } catch {
        // Keep the dependency error as the block's failure.
        break;
      } finally {
        resumeTask();
      }

      // The handler may have waited until after destruction.
      if (environmentInjector.destroyed) {
        break;
      }
    }

    results = await Promise.allSettled(dependenciesFn());
  }

  return results;
}

/**
 * Waits for the handler to retry or fail. Resolving the handler's promise does
 * not start a retry because it may call `retry()` later.
 */
function invokeDeferBlockRetryHandler(
  handler: DeferBlockRetryHandler,
  environmentInjector: EnvironmentInjector,
  round: {attempt: number; maxRetryCount: number; error: unknown},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let unregisterDestroy = () => {};
    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      unregisterDestroy();
      callback();
    };

    // Stop waiting when the handler's injector is destroyed.
    unregisterDestroy = environmentInjector.onDestroy(() => settle(reject));

    const context: DeferBlockRetryContext = {
      attempt: round.attempt,
      maxRetryCount: round.maxRetryCount,
      error: round.error,
      retry: () => settle(resolve),
    };

    let result: void | Promise<void>;
    try {
      // Run outside the Angular zone so that timers in the handler don't keep the
      // application unstable.
      result = environmentInjector
        .get(NgZone)
        .runOutsideAngular(() =>
          runInInjectionContext(environmentInjector, () => handler(context)),
        );
    } catch (error) {
      settle(() => reject(error));
      return;
    }

    if (isPromise(result)) {
      result.then(undefined, (error) => settle(() => reject(error)));
    }
  });
}
