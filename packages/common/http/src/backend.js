/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {FetchBackend} from './fetch';
import {HttpXhrBackend} from './xhr';
import {
  inject,
  Injectable,
  ɵConsole as Console,
  ɵformatRuntimeError as formatRuntimeError,
  PendingTasks,
} from '@angular/core';
import {finalize} from 'rxjs/operators';
import {
  HTTP_INTERCEPTOR_FNS,
  HTTP_ROOT_INTERCEPTOR_FNS,
  REQUESTS_CONTRIBUTE_TO_STABILITY,
  chainedInterceptorFn,
  interceptorChainEndFn,
} from './interceptor';
/**
 * A final `HttpHandler` which will dispatch the request via browser HTTP APIs to a backend.
 *
 * Interceptors sit between the `HttpClient` interface and the `HttpBackend`.
 *
 * When injected, `HttpBackend` dispatches requests directly to the backend, without going
 * through the interceptor chain.
 *
 * @publicApi
 */
let HttpBackend = class HttpBackend {};
HttpBackend = __decorate(
  [Injectable({providedIn: 'root', useExisting: HttpXhrBackend})],
  HttpBackend,
);
export {HttpBackend};
let fetchBackendWarningDisplayed = false;
/** Internal function to reset the flag in tests */
export function resetFetchBackendWarningFlag() {
  fetchBackendWarningDisplayed = false;
}
let HttpInterceptorHandler = class HttpInterceptorHandler {
  constructor(backend, injector) {
    this.backend = backend;
    this.injector = injector;
    this.chain = null;
    this.pendingTasks = inject(PendingTasks);
    this.contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);
    // We strongly recommend using fetch backend for HTTP calls when SSR is used
    // for an application. The logic below checks if that's the case and produces
    // a warning otherwise.
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !fetchBackendWarningDisplayed) {
      // This flag is necessary because provideHttpClientTesting() overrides the backend
      // even if `withFetch()` is used within the test. When the testing HTTP backend is provided,
      // no HTTP calls are actually performed during the test, so producing a warning would be
      // misleading.
      const isTestingBackend = this.backend.isTestingBackend;
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
              2801 /* RuntimeErrorCode.NOT_USING_FETCH_BACKEND_IN_SSR */,
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
  handle(initialRequest) {
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
        interceptorChainEndFn,
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
};
HttpInterceptorHandler = __decorate([Injectable({providedIn: 'root'})], HttpInterceptorHandler);
export {HttpInterceptorHandler};
/**
 * Transforms an `HttpRequest` into a stream of `HttpEvent`s, one of which will likely be a
 * `HttpResponse`.
 *
 * `HttpHandler` is injectable. When injected, the handler instance dispatches requests to the
 * first interceptor in the chain, which dispatches to the second, etc, eventually reaching the
 * `HttpBackend`.
 *
 * In an `HttpInterceptor`, the `HttpHandler` parameter is the next interceptor in the chain.
 *
 * @publicApi
 */
let HttpHandler = class HttpHandler {};
HttpHandler = __decorate(
  [Injectable({providedIn: 'root', useExisting: HttpInterceptorHandler})],
  HttpHandler,
);
export {HttpHandler};
//# sourceMappingURL=backend.js.map
