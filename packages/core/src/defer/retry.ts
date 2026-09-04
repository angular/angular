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
import {DependencyType} from '../render3/interfaces/definition';
import {isPromise} from '../util/lang';
import {DeferDependenciesLoadResult, DependencyResolverFn, TDeferBlockDetails} from './interfaces';
import {
  DEFER_BLOCK_RETRY_HANDLER,
  DeferBlockRetryContext,
  DeferBlockRetryHandler,
} from './retry_handler';
import {
  DeferDependency,
  invokeDeferDependencyLoader,
  isDeferBlockDependencyLoader,
} from './triggering';

/** Marks an unresolved dependency. */
const NOT_RESOLVED = Symbol('NOT_RESOLVED');

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
 * Retries only dependencies that have not succeeded. Each round invokes the
 * same compiler-generated dynamic import again and relies on the browser's
 * module map behavior.
 */
async function loadDeferDependenciesWithRetry(
  dependenciesFn: DependencyResolverFn,
  injector: Injector,
  maxRetryCount: number,
): Promise<DeferDependenciesLoadResult> {
  const environmentInjector = injector.get(EnvironmentInjector);
  const retryHandler = injector.get(DEFER_BLOCK_RETRY_HANDLER, null, {optional: true});
  const attemptCount = maxRetryCount + 1;
  let dependencies: DeferDependency[] | null = null;
  let resolved: Array<DependencyType | typeof NOT_RESOLVED> = [];
  let lastError: unknown;

  for (let attempt = 0; attempt < attemptCount; attempt++) {
    if (attempt > 0) {
      // Do not start another request after the injector is destroyed.
      if (environmentInjector.destroyed) {
        return {dependencies: null, error: lastError};
      }

      if (retryHandler !== null) {
        try {
          await invokeDeferBlockRetryHandler(retryHandler, environmentInjector, {
            attempt,
            maxRetryCount,
            error: lastError,
          });
        } catch {
          // Keep the dependency error as the block's failure.
          return {dependencies: null, error: lastError};
        }
      }

      // The handler may have waited until after destruction.
      if (environmentInjector.destroyed) {
        return {dependencies: null, error: lastError};
      }
    }

    if (dependencies === null) {
      try {
        dependencies = dependenciesFn();
      } catch (error) {
        lastError = error;
        if (attempt === attemptCount - 1) {
          return {dependencies: null, error};
        }
        continue;
      }

      resolved = new Array(dependencies.length).fill(NOT_RESOLVED);
    }

    const pendingIndexes: number[] = [];
    const pendingLoads: Array<Promise<DependencyType>> = [];
    const pendingRetryable: boolean[] = [];

    for (let index = 0; index < dependencies.length; index++) {
      if (resolved[index] !== NOT_RESOLVED) {
        continue;
      }

      const dependency = dependencies[index];
      if (isDeferBlockDependencyLoader(dependency)) {
        pendingIndexes.push(index);
        pendingLoads.push(invokeDeferDependencyLoader(dependency));
        pendingRetryable.push(true);
      } else if (isPromise<DependencyType>(dependency)) {
        // A failed promise cannot be loaded again, so it ends the retry sequence.
        pendingIndexes.push(index);
        pendingLoads.push(Promise.resolve(dependency));
        pendingRetryable.push(false);
      } else {
        resolved[index] = dependency;
      }
    }

    const results = await Promise.allSettled(pendingLoads);
    let hasFailure = false;
    let hasTerminalFailure = false;
    for (let index = 0; index < results.length; index++) {
      const dependencyIndex = pendingIndexes[index];
      const result = results[index];
      if (result.status === 'fulfilled') {
        resolved[dependencyIndex] = result.value;
      } else {
        if (!hasFailure) {
          lastError = result.reason;
          hasFailure = true;
        }
        if (!pendingRetryable[index]) {
          hasTerminalFailure = true;
        }
      }
    }

    if (resolved.every((dependency) => dependency !== NOT_RESOLVED)) {
      return {dependencies: resolved as DependencyType[], error: null};
    }

    if (hasTerminalFailure || attempt === attemptCount - 1) {
      return {dependencies: null, error: lastError};
    }
  }

  return {dependencies: null, error: lastError};
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
      result = runInInjectionContext(environmentInjector, () => handler(context));
    } catch (error) {
      settle(() => reject(error));
      return;
    }

    if (isPromise(result)) {
      result.then(undefined, (error) => settle(() => reject(error)));
    }
  });
}
