/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {HttpBackend} from './backend';
import {HttpRequest, HttpResponse} from './request_response';

/**
 * DI multibinding token for {@link HttpInterceptor}s.
 */
export const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>('HTTP_INTERCEPTORS');

/**
 * Intercepts outgoing `{@link HttpRequest}s or their corresponding {@link HttpResponse}s
 * in order to add behavior or logic.
 *
 * Interceptors are run in the order in which they're bound in DI. Each interceptor has the
 * opportunity to manipulate the {@link HttpRequest} instance before it is sent, as well as
 * to manipulate the {@link HttpResponse} via `Observable` operators.
 *
 * Interceptors receive a {@link HttpBackend} representing either the next interceptor in the
 * chain, or the final backend which will dispatch the request. It is not required that an
 * interceptor pass the request to the next backend - requests can be handled by an interceptor
 * directly.
 */
export abstract class HttpInterceptor {
  /**
   * Intercepts an outgoing request and handles it, either by returning `next.handle(req)` or
   * by handling the request itself.
   */
  abstract intercept(req: HttpRequest, next: HttpBackend): Observable<HttpResponse>;
}

/**
 * An {@link HttpBackend} that processes a request with an interceptor before delegating to
 * the next backend.
 */
export class HttpNextInterceptorBackend implements HttpBackend {
  constructor(private interceptor: HttpInterceptor, private next: HttpBackend) {}

  handle(req: HttpRequest): Observable<HttpResponse> {
    return this.interceptor.intercept(req, this.next);
  }
}

/**
 * Build a chain of interceptor @{link HttpBackend}s.
 */
export function buildInterceptorChain(
    interceptors: HttpInterceptor[], finalBackend: HttpBackend): HttpBackend {
  return interceptors.reduceRight(
      (backend: HttpBackend, interceptor: HttpInterceptor) =>
          new HttpNextInterceptorBackend(interceptor, backend),
      finalBackend);
}
