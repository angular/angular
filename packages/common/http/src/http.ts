/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, Injectable, InjectionToken, Injector} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpHandlerFn, HttpInterceptorFn} from './interceptor_fn';
import {HttpRequest} from './request';
import {HttpEvent} from './response';
import {HttpXhrBackend} from './xhr';
import {xsrfInterceptor} from './xsrf';

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
 * @see [HTTP Guide](guide/http#intercepting-requests-and-responses)
 *
 * @usageNotes
 *
 * To use the same instance of `HttpInterceptors` for the entire app, import the `HttpClientModule`
 * only in your `AppModule`, and add the interceptors to the root application injector.
 * If you import `HttpClientModule` multiple times across different modules (for example, in lazy
 * loading modules), each import creates a new copy of the `HttpClientModule`, which overwrites the
 * interceptors provided in the root module.
 *
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
 * A multi-provider token that represents the array of registered
 * `HttpInterceptor` objects.
 *
 * @publicApi
 */
export const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>('HTTP_INTERCEPTORS');

/**
 * An injectable `HttpHandler` that applies multiple interceptors
 * to a request before passing it to the given `HttpBackend`.
 *
 * The interceptors are loaded lazily from the injector, to allow
 * interceptors to themselves inject classes depending indirectly
 * on `HttpInterceptingHandler` itself.
 *
 * @see `HttpInterceptor`
 */
@Injectable({providedIn: 'root'})
export class HttpInterceptingHandler implements HttpHandler {
  private chain: HttpHandler|null = null;

  private interceptors = new Map<HttpInterceptorFn, EnvironmentInjector>();
  private haveAddedInterceptorsFromDi = false;

  constructor(private backend: HttpBackend, private injector: EnvironmentInjector) {
    // Add the default XSRF interceptor at the beginning of the chain.
    this.interceptors.set(xsrfInterceptor, injector);
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (this.chain === null) {
      if (!this.haveAddedInterceptorsFromDi) {
        for (const interceptor of this.injector.get(HTTP_INTERCEPTORS, [])) {
          this.interceptors.set(wrapInterceptorToFn(interceptor), this.injector);
        }
        this.haveAddedInterceptorsFromDi = true;
      }

      // clang-format off
      this.chain = Array.from(this.interceptors).reduceRight(
          (next, [interceptor, injector]) =>
              new HttpInterceptorHandler(next, interceptor, injector),
          this.backend);
      // clang-format on
    }
    return this.chain.handle(req);
  }

  maybeAddInterceptorsWithInjector(
      interceptors: HttpInterceptorFn[], injector: EnvironmentInjector) {
    for (const interceptor of interceptors) {
      if (this.interceptors.has(interceptor)) {
        // Don't add interceptors that have already been registered, even under different
        // injectors.
        continue;
      }

      this.interceptors.set(interceptor, injector);
      this.chain = null;
    }
  }
}

/**
 * `HttpHandler` which applies an `HttpInterceptor` to an `HttpRequest`.
 */
export class HttpInterceptorHandler implements HttpHandler {
  private next: HttpHandlerFn;
  constructor(
      nextHandler: HttpHandler, private interceptor: HttpInterceptorFn,
      private injector: EnvironmentInjector) {
    this.next = nextHandler.handle.bind(nextHandler);
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return this.injector.runInContext(() => this.interceptor(req, this.next));
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
@Injectable({
  providedIn: 'root',
  useExisting: HttpInterceptingHandler,
})
export abstract class HttpHandler {
  abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

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

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}

function wrapInterceptorToFn(interceptor: HttpInterceptor): HttpInterceptorFn {
  return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    return interceptor.intercept(req, {handle: next});
  };
}
