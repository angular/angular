/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IDLE_SERVICE} from '../defer/idle_service';
import {DefaultExport, maybeUnwrapDefaultExport} from '../util/default_export';
import {promiseWithResolvers} from '../util/promise_with_resolvers';
import {assertInInjectionContext} from './contextual';
import {Injector} from './injector';
import {inject} from './injector_compatibility';
import {ProviderToken} from './provider_token';

type InjectAsyncLoaderResult<T> = ProviderToken<T> | DefaultExport<ProviderToken<T>>;

/**
 * A helper function that allows to inject dependencies asynchronously,
 * which can be useful in cases when the dependency is not needed immediately and can be loaded lazily.
 *
 * NOTE: To enable lazy loading, the injected service must be auto-provided. This means it should be decorated with either `@Injectable({providedIn: 'root'})` or `@Service()`.
 *
 * @param loader A function that returns a promise resolving to the injectable service
 * @param options Configuration options for the async injection
 *
 * @returns A function that returns a promise resolving to the requested service instance.
 *
 * @usageNotes
 *
 * ```ts
 * class MyCmp {
 *  someSvc = injectAsync(() => import('..'));
 *
 *  async onClick() {
 *    (await this.someSvc()).handleClick();
 *  }
 * }
 *
 * // we can also configure prefetching:
 * injectAsync(.., {prefetch: onIdle})
 * ```
 *
 * @see [Lazy loading services](guide/di/lazy-loading-services)
 * @see [Injection context](guide/di/dependency-injection-context)
 *
 * @publicApi 22.0
 */
export function injectAsync<T>(
  loader: () => Promise<ProviderToken<T>>,
  options?: InjectAsyncOptions,
): () => Promise<T>;
export function injectAsync<T>(
  loader: () => Promise<DefaultExport<ProviderToken<T>>>,
  options?: InjectAsyncOptions,
): () => Promise<T>;
export function injectAsync<T>(
  loader: () => Promise<InjectAsyncLoaderResult<T>>,
  options?: InjectAsyncOptions,
): () => Promise<T> {
  if (ngDevMode) {
    assertInInjectionContext(injectAsync);
  }

  const injector = inject(Injector);

  let loadedPromise: Promise<InjectAsyncLoaderResult<T>> | null = null;
  const load = () => {
    if (!loadedPromise) {
      loadedPromise = loader();
    }
    return loadedPromise;
  };

  if (options?.prefetch) {
    options.prefetch().then(() => load());
  }

  // We can't use `inject` later on because of the async nature of the loader
  return () => load().then((loadedToken) => injector.get(maybeUnwrapDefaultExport(loadedToken))!);
}

/**
 * Interface for `options` argument used within `injectAsync` call.
 *
 * @see [Prefetching the dependency](guide/di/lazy-loading-services#prefetching-the-dependency)
 *
 * @publicApi 22.0
 */
export interface InjectAsyncOptions {
  /**
   * A trigger to eagerly prefetch the lazy-loaded dependency before it is requested.
   *
   */
  prefetch?: PrefetchTrigger;
}

/**
 * A function that returns a promise which, when resolved, will trigger the prefetching of
 * the lazy-loaded dependency.
 *
 * @see {@link onIdle}
 * @see [Prefetching the dependency](guide/di/lazy-loading-services#prefetching-the-dependency)
 *
 * @publicApi 22.0
 */
export type PrefetchTrigger = () => Promise<void>;

/**
 * A `PrefetchTrigger` helper function to provide the logic of triggering dependency loading
 * when the browser becomes idle.
 *
 * Internally delegates to the configured {@link IdleService}, whose default implementation uses
 * [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback)
 * when available and falls back to `setTimeout` otherwise. The default behavior can be replaced
 * with `provideIdleServiceWith`.
 *
 * @usageNotes
 *
 * ```ts
 * injectAsync(import(...), {prefetch: onIdle})
 *
 * // or with custom idle options:
 * injectAsync(import(...), {prefetch: () => onIdle({timeout: 100})})
 * ```
 *
 * @see [Prefetching the dependency](guide/di/lazy-loading-services#prefetching-the-dependency)
 *
 * @publicApi 22.0
 */
export function onIdle(options?: {timeout?: number}): Promise<void> {
  if (ngDevMode) {
    assertInInjectionContext(injectAsync);
  }

  const idleService = inject(IDLE_SERVICE);
  const {promise, resolve} = promiseWithResolvers<void>();
  idleService.requestOnIdle(() => resolve(), options);

  return promise;
}
