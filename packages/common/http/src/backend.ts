/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';

import {HttpRequest} from './request';
import {HttpEvent} from './response';
import {FetchBackend} from './fetch';
import {HttpXhrBackend} from './xhr';
import {isPlatformServer} from '@angular/common';
import {
  EnvironmentInjector,
  inject,
  Injectable,
  PLATFORM_ID,
  ɵConsole as Console,
  ɵformatRuntimeError as formatRuntimeError,
  PendingTasks,
} from '@angular/core';
import {finalize} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';
import {
  ChainedInterceptorFn,
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
@Injectable({providedIn: 'root', useExisting: HttpXhrBackend})
export abstract class HttpBackend implements HttpHandler {
  abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

let fetchBackendWarningDisplayed = false;

/** Internal function to reset the flag in tests */
export function resetFetchBackendWarningFlag() {
  fetchBackendWarningDisplayed = false;
}

@Injectable({providedIn: 'root'})
export class HttpInterceptorHandler implements HttpHandler {
  private chain: ChainedInterceptorFn<unknown> | null = null;
  private readonly pendingTasks = inject(PendingTasks);
  private readonly contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);

  constructor(
    private backend: HttpBackend,
    private injector: EnvironmentInjector,
  ) {
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

  handle(initialRequest: HttpRequest<any>): Observable<HttpEvent<any>> {
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
@Injectable({providedIn: 'root', useExisting: HttpInterceptorHandler})
export abstract class HttpHandler {
  abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
