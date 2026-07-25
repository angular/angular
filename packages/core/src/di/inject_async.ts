/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IDLE_SERVICE} from '../defer/idle_service';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {DestroyRef} from '../linker/destroy_ref';
import {DefaultExport, maybeUnwrapDefaultExport} from '../util/default_export';
import {promiseWithResolvers} from '../util/promise_with_resolvers';
import {stringify} from '../util/stringify';
import {assertInInjectionContext} from './contextual';
import {DestroyableInjector, Injector} from './injector';
import {inject} from './injector_compatibility';
import {ProviderToken} from './provider_token';

type InjectAsyncLoaderResult<T> = ProviderToken<T> | DefaultExport<ProviderToken<T>>;

/**
 * A helper function that allows to inject dependencies asynchronously,
 * which can be useful in cases when the dependency is not needed immediately and can be loaded lazily.
 *
 * NOTE: By default, the injected service must be auto-provided. This means it should be decorated with either `@Injectable({providedIn: 'root'})` or `@Service()`. Alternatively, the `{scope: 'self'}` option allows a plain `@Injectable()` class that is not provided anywhere to be lazily provided at the caller's injector scope.
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
  const scope = options?.scope;
  // With `scope: 'self'` the `DestroyRef` must be captured eagerly: by the time the loader
  // resolves, the caller might already be destroyed and its injector unusable.
  const destroyRef = scope === 'self' ? inject(DestroyRef) : null;

  let loadedPromise: Promise<InjectAsyncLoaderResult<T>> | null = null;
  const load = () => {
    if (!loadedPromise) {
      loadedPromise = loader();
    }
    return loadedPromise;
  };

  if (options?.prefetch) {
    options
      .prefetch()
      .then(() => load())
      .catch(() => {});
  }

  // The injector that self-provides the loaded class, created at most once per `injectAsync`
  // call-site so that repeated invocations of the returned function resolve the same instance.
  let scopedInjector: DestroyableInjector | null = null;

  const resolveToken = (token: ProviderToken<T>): T => {
    if (scope !== 'self') {
      return injector.get(token)!;
    }

    if (scopedInjector !== null) {
      return scopedInjector.get(token);
    }

    if (destroyRef!.destroyed) {
      throw new RuntimeError(
        RuntimeErrorCode.INJECTOR_ALREADY_DESTROYED,
        ngDevMode &&
          `injectAsync: cannot resolve ${stringify(token)} because the injection ` +
            `context that called \`injectAsync\` has already been destroyed.`,
      );
    }

    // Resolve up the chain first, so that an ancestor/component provider
    // or a `TestBed` override still wins over self-provisioning.
    const existing = injector.get(token, NOT_PROVIDED as unknown as T);
    if ((existing as unknown) !== NOT_PROVIDED) {
      return existing;
    }

    if (ngDevMode && typeof token !== 'function') {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_INJECTION_TOKEN,
        `injectAsync: the token loaded with \`scope: 'self'\` must be a class ` +
          `so that it can be self-provided, but got: ${stringify(token)}. ` +
          `Provide the token in an injector instead.`,
      );
    }

    scopedInjector = Injector.create({
      providers: [{provide: token, useClass: token as Type<T>}],
      parent: injector,
    });
    // Tie the child injector's lifecycle to the caller: when the caller is destroyed the instance
    // is destroyed too (`ngOnDestroy` / `DestroyRef.onDestroy` fire), like a component-provided
    // service.
    const scoped = scopedInjector;
    destroyRef!.onDestroy(() => scoped.destroy());
    return scopedInjector.get(token);
  };

  // We can't use `inject` later on because of the async nature of the loader
  return () => load().then((loadedToken) => resolveToken(maybeUnwrapDefaultExport(loadedToken)));
}

/**
 * Sentinel returned by `Injector.get` when the token is not provided anywhere up the chain. A fresh
 * object reference, so it can never collide with an actual provided value (including `null`).
 */
const NOT_PROVIDED = {};

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

  /**
   * Controls what happens when the loaded token is not provided anywhere up the injector chain.
   *
   * - When omitted (the default), the token is resolved with `injector.get` and an `NG0201` error
   *   is thrown if it is not provided anywhere - the existing behavior.
   * - `'self'` resolves the token up the chain first (so an ancestor/component provider or a
   *   `TestBed` override still wins) and, only if it is not provided anywhere, lazily provides the
   *   loaded class at the caller's injector scope, tying its lifecycle to the caller. Requires the
   *   loader to resolve to a concrete class. Each `injectAsync` call-site self-provides at most one
   *   instance: repeated invocations of the returned function resolve the same instance.
   */
  scope?: 'self';
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
    assertInInjectionContext(onIdle);
  }

  const idleService = inject(IDLE_SERVICE);
  const {promise, resolve} = promiseWithResolvers<void>();
  idleService.requestOnIdle(() => resolve(), options);

  return promise;
}
