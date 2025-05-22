/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  runInInjectionContext,
  ɵConsole as Console,
  ɵformatRuntimeError as formatRuntimeError,
  PendingTasks,
} from '@angular/core';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {HttpBackend, HttpHandler} from './backend';
import {RuntimeErrorCode} from './errors';
import {FetchBackend} from './fetch';
import {HttpRequest} from './request';
import {HttpEvent} from './response';

/**
 * Intercepts and handles an `HttpRequest` or `HttpResponse`.
 *
 * Most interceptors transform the outgoing request before passing it to the
 * next interceptor in the chain, by calling `next.handle(transformedReq)`.
 * An interceptor may transform the
 * response event stream as well, by applying additional RxJS operators on the stream
 * returned by `next.handle()`.
 *
 * More rarely, an interceptor may handle the request entirely,
 * and compose a new event stream instead of invoking `next.handle()`. This is an
 * acceptable behavior, but keep in mind that further interceptors will be skipped entirely.
 *
 * It is also rare but valid for an interceptor to return multiple responses on the
 * event stream for a single request.
 *
 * @publicApi
 *
 * @see [HTTP Guide](guide/http/interceptors)
 * @see {@link HttpInterceptorFn}
 *
 * @usageNotes
 *
 * To use the same instance of `HttpInterceptors` for the entire app, import the `HttpClientModule`
 * only in your `AppModule`, and add the interceptors to the root application injector.
 * If you import `HttpClientModule` multiple times across different modules (for example, in lazy
 * loading modules), each import creates a new copy of the `HttpClientModule`, which overwrites the
 * interceptors provided in the root module.
 */
export interface HttpInterceptor {
  /**
   * Identifies and handles a given HTTP request.
   * @param req The outgoing request object to handle.
   * @param next The next interceptor in the chain, or the backend
   * if no interceptors remain in the chain.
   * @returns An observable of the event stream.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}

/**
 * Represents the next interceptor in an interceptor chain, or the real backend if there are no
 * further interceptors.
 *
 * Most interceptors will delegate to this function, and either modify the outgoing request or the
 * response when it arrives. Within the scope of the current request, however, this function may be
 * called any number of times, for any number of downstream requests. Such downstream requests need
 * not be to the same URL or even the same origin as the current request. It is also valid to not
 * call the downstream handler at all, and process the current request entirely within the
 * interceptor.
 *
 * This function should only be called within the scope of the request that's currently being
 * intercepted. Once that request is complete, this downstream handler function should not be
 * called.
 *
 * @publicApi
 *
 * @see [HTTP Guide](guide/http/interceptors)
 */
export type HttpHandlerFn = (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;

/**
 * An interceptor for HTTP requests made via `HttpClient`.
 *
 * `HttpInterceptorFn`s are middleware functions which `HttpClient` calls when a request is made.
 * These functions have the opportunity to modify the outgoing request or any response that comes
 * back, as well as block, redirect, or otherwise change the request or response semantics.
 *
 * An `HttpHandlerFn` representing the next interceptor (or the backend which will make a real HTTP
 * request) is provided. Most interceptors will delegate to this function, but that is not required
 * (see `HttpHandlerFn` for more details).
 *
 * `HttpInterceptorFn`s are executed in an [injection context](guide/di/dependency-injection-context).
 * They have access to `inject()` via the `EnvironmentInjector` from which they were configured.
 *
 * @see [HTTP Guide](guide/http/interceptors)
 * @see {@link withInterceptors}
 *
 * @usageNotes
 * Here is a noop interceptor that passes the request through without modifying it:
 * ```ts
 * export const noopInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next:
 * HttpHandlerFn) => {
 *   return next(modifiedReq);
 * };
 * ```
 *
 * If you want to alter a request, clone it first and modify the clone before passing it to the
 * `next()` handler function.
 *
 * Here is a basic interceptor that adds a bearer token to the headers
 * ```ts
 * export const authenticationInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next:
 * HttpHandlerFn) => {
 *    const userToken = 'MY_TOKEN'; const modifiedReq = req.clone({
 *      headers: req.headers.set('Authorization', `Bearer ${userToken}`),
 *    });
 *
 *    return next(modifiedReq);
 * };
 * ```
 */
export type HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => Observable<HttpEvent<unknown>>;

/**
 * Function which invokes an HTTP interceptor chain.
 *
 * Each interceptor in the interceptor chain is turned into a `ChainedInterceptorFn` which closes
 * over the rest of the chain (represented by another `ChainedInterceptorFn`). The last such
 * function in the chain will instead delegate to the `finalHandlerFn`, which is passed down when
 * the chain is invoked.
 *
 * This pattern allows for a chain of many interceptors to be composed and wrapped in a single
 * `HttpInterceptorFn`, which is a useful abstraction for including different kinds of interceptors
 * (e.g. legacy class-based interceptors) in the same chain.
 */
type ChainedInterceptorFn<RequestT> = (
  req: HttpRequest<RequestT>,
  finalHandlerFn: HttpHandlerFn,
) => Observable<HttpEvent<RequestT>>;

function interceptorChainEndFn(
  req: HttpRequest<any>,
  finalHandlerFn: HttpHandlerFn,
): Observable<HttpEvent<any>> {
  return finalHandlerFn(req);
}

/**
 * Constructs a `ChainedInterceptorFn` which adapts a legacy `HttpInterceptor` to the
 * `ChainedInterceptorFn` interface.
 */
function adaptLegacyInterceptorToChain(
  chainTailFn: ChainedInterceptorFn<any>,
  interceptor: HttpInterceptor,
): ChainedInterceptorFn<any> {
  return (initialRequest, finalHandlerFn) =>
    interceptor.intercept(initialRequest, {
      handle: (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn),
    });
}

/**
 * Constructs a `ChainedInterceptorFn` which wraps and invokes a functional interceptor in the given
 * injector.
 */
function chainedInterceptorFn(
  chainTailFn: ChainedInterceptorFn<unknown>,
  interceptorFn: HttpInterceptorFn,
  injector: EnvironmentInjector,
): ChainedInterceptorFn<unknown> {
  return (initialRequest, finalHandlerFn) =>
    runInInjectionContext(injector, () =>
      interceptorFn(initialRequest, (downstreamRequest) =>
        chainTailFn(downstreamRequest, finalHandlerFn),
      ),
    );
}

/**
 * A multi-provider token that represents the array of registered
 * `HttpInterceptor` objects.
 *
 * @publicApi
 */
export const HTTP_INTERCEPTORS = new InjectionToken<readonly HttpInterceptor[]>(
  ngDevMode ? 'HTTP_INTERCEPTORS' : '',
);

/**
 * A multi-provided token of `HttpInterceptorFn`s.
 */
export const HTTP_INTERCEPTOR_FNS = new InjectionToken<readonly HttpInterceptorFn[]>(
  ngDevMode ? 'HTTP_INTERCEPTOR_FNS' : '',
);

/**
 * A multi-provided token of `HttpInterceptorFn`s that are only set in root.
 */
export const HTTP_ROOT_INTERCEPTOR_FNS = new InjectionToken<readonly HttpInterceptorFn[]>(
  ngDevMode ? 'HTTP_ROOT_INTERCEPTOR_FNS' : '',
);

// TODO(atscott): We need a larger discussion about stability and what should contribute to stability.
// Should the whole interceptor chain contribute to stability or just the backend request #55075?
// Should HttpClient contribute to stability automatically at all?
export const REQUESTS_CONTRIBUTE_TO_STABILITY = new InjectionToken<boolean>(
  ngDevMode ? 'REQUESTS_CONTRIBUTE_TO_STABILITY' : '',
  {providedIn: 'root', factory: () => true},
);

/**
 * Creates an `HttpInterceptorFn` which lazily initializes an interceptor chain from the legacy
 * class-based interceptors and runs the request through it.
 */
export function legacyInterceptorFnFactory(): HttpInterceptorFn {
  let chain: ChainedInterceptorFn<any> | null = null;

  return (req, handler) => {
    if (chain === null) {
      const interceptors = inject(HTTP_INTERCEPTORS, {optional: true}) ?? [];
      // Note: interceptors are wrapped right-to-left so that final execution order is
      // left-to-right. That is, if `interceptors` is the array `[a, b, c]`, we want to
      // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
      // out.
      chain = interceptors.reduceRight(
        adaptLegacyInterceptorToChain,
        interceptorChainEndFn as ChainedInterceptorFn<any>,
      );
    }

    const pendingTasks = inject(PendingTasks);
    const contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);
    if (contributeToStability) {
      const removeTask = pendingTasks.add();
      return chain(req, handler).pipe(finalize(removeTask));
    } else {
      return chain(req, handler);
    }
  };
}

let fetchBackendWarningDisplayed = false;

/** Internal function to reset the flag in tests */
export function resetFetchBackendWarningFlag() {
  fetchBackendWarningDisplayed = false;
}

@Injectable()
export class HttpInterceptorHandler extends HttpHandler {
  private chain: ChainedInterceptorFn<unknown> | null = null;
  private readonly pendingTasks = inject(PendingTasks);
  private readonly contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);

  constructor(
    private backend: HttpBackend,
    private injector: EnvironmentInjector,
  ) {
    super();

    // We strongly recommend using fetch backend for HTTP calls when SSR is used
    // for an application. The logic below checks if that's the case and produces
    // a warning otherwise.
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !fetchBackendWarningDisplayed) {
      // This flag is necessary because provideHttpClientTesting() overrides the backend
      // even if `withFetch()` is used within the test. When the testing HTTP backend is provided,
      // no HTTP calls are actually performed during the test, so producing a warning would be
      // misleading.
      const isTestingBackend = (this.backend as any).isTestingBackend;

      if (
        typeof ngServerMode !== 'undefined' &&
        ngServerMode &&
        !(this.backend instanceof FetchBackend) &&
        !isTestingBackend
      ) {
        fetchBackendWarningDisplayed = true;
        injector
          .get(Console)
          .warn(
            formatRuntimeError(
              RuntimeErrorCode.NOT_USING_FETCH_BACKEND_IN_SSR,
              'Angular detected that `HttpClient` is not configured ' +
                "to use `fetch` APIs. It's strongly recommended to " +
                'enable `fetch` for applications that use Server-Side Rendering ' +
                'for better performance and compatibility. ' +
                'To enable `fetch`, add the `withFetch()` to the `provideHttpClient()` ' +
                'call at the root of the application.',
            ),
          );
      }
    }
  }

  override handle(initialRequest: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (this.chain === null) {
      const dedupedInterceptorFns = Array.from(
        new Set([
          ...this.injector.get(HTTP_INTERCEPTOR_FNS),
          ...this.injector.get(HTTP_ROOT_INTERCEPTOR_FNS, []),
        ]),
      );

      // Note: interceptors are wrapped right-to-left so that final execution order is
      // left-to-right. That is, if `dedupedInterceptorFns` is the array `[a, b, c]`, we want to
      // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
      // out.
      this.chain = dedupedInterceptorFns.reduceRight(
        (nextSequencedFn, interceptorFn) =>
          chainedInterceptorFn(nextSequencedFn, interceptorFn, this.injector),
        interceptorChainEndFn as ChainedInterceptorFn<unknown>,
      );
    }

    if (this.contributeToStability) {
      const removeTask = this.pendingTasks.add();
      return this.chain(initialRequest, (downstreamRequest) =>
        this.backend.handle(downstreamRequest),
      ).pipe(finalize(removeTask));
    } else {
      return this.chain(initialRequest, (downstreamRequest) =>
        this.backend.handle(downstreamRequest),
      );
    }
  }
}
