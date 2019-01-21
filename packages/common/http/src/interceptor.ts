/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpHandler} from './backend';
import {HttpRequest} from './request';
import {HttpEvent} from './response';

/**
 * Intercepts `HttpRequest` and handles them.
 *
 * Most interceptors will transform the outgoing request before passing it to the
 * next interceptor in the chain, by calling `next.handle(transformedReq)`.
 *
 * In rare cases, interceptors may wish to completely handle a request themselves,
 * and not delegate to the remainder of the chain. This behavior is allowed.
 *
 * @publicApi
 */
export interface HttpInterceptor {
  /**
   * Intercept an outgoing `HttpRequest` and optionally transform it or the
   * response.
   *
   * Typically an interceptor will transform the outgoing request before returning
   * `next.handle(transformedReq)`. An interceptor may choose to transform the
   * response event stream as well, by applying additional Rx operators on the stream
   * returned by `next.handle()`.
   *
   * More rarely, an interceptor may choose to completely handle the request itself,
   * and compose a new event stream instead of invoking `next.handle()`. This is
   * acceptable behavior, but keep in mind further interceptors will be skipped entirely.
   *
   * It is also rare but valid for an interceptor to return multiple responses on the
   * event stream for a single request.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}

/**
 * `HttpHandler` which applies an `HttpInterceptor` to an `HttpRequest`.
 *
 *
 */
export class HttpInterceptorHandler implements HttpHandler {
  constructor(private next: HttpHandler, private interceptor: HttpInterceptor) {}

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return this.interceptor.intercept(req, this.next);
  }
}

/**
 * A multi-provider token which represents the array of `HttpInterceptor`s that
 * are registered.
 *
 * @publicApi
 */
export const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>('HTTP_INTERCEPTORS');

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}
