/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, ModuleWithProviders, NgModule, Optional} from '@angular/core';

import {HttpBackend, HttpHandler} from './backend';
import {HttpClient} from './client';
import {HTTP_INTERCEPTORS, HttpInterceptor, HttpInterceptorHandler, NoopInterceptor} from './interceptor';
import {JsonpCallbackContext, JsonpClientBackend, JsonpInterceptor} from './jsonp';
import {BrowserXhr, HttpXhrBackend, XhrFactory} from './xhr';
import {HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_HEADER_NAME} from './xsrf';



/**
 * Constructs an `HttpHandler` that applies a bunch of `HttpInterceptor`s
 * to a request before passing it to the given `HttpBackend`.
 *
 * Meant to be used as a factory function within `HttpClientModule`.
 *
 * @experimental
 */
export function interceptingHandler(
    backend: HttpBackend, interceptors: HttpInterceptor[] | null = []): HttpHandler {
  if (!interceptors) {
    return backend;
  }
  return interceptors.reduceRight(
      (next, interceptor) => new HttpInterceptorHandler(next, interceptor), backend);
}

/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 * @experimental
 */
export function jsonpCallbackContext(): Object {
  if (typeof window === 'object') {
    return window;
  }
  return {};
}

/**
 * `NgModule` which adds XSRF protection support to outgoing requests.
 *
 * Provided the server supports a cookie-based XSRF protection system, this
 * module can be used directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no such names are provided, the default is to use `X-XSRF-TOKEN` for
 * the header name and `XSRF-TOKEN` for the cookie name.
 *
 * @experimental
 */
@NgModule({
  providers: [
    HttpXsrfInterceptor,
    {provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true},
    {provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor},
    {provide: XSRF_COOKIE_NAME, useValue: 'XSRF-TOKEN'},
    {provide: XSRF_HEADER_NAME, useValue: 'X-XSRF-TOKEN'},
  ],
})
export class HttpClientXsrfModule {
  /**
   * Disable the default XSRF protection.
   */
  static disable(): ModuleWithProviders {
    return {
      ngModule: HttpClientXsrfModule,
      providers: [
        {provide: HttpXsrfInterceptor, useClass: NoopInterceptor},
      ],
    };
  }

  /**
   * Configure XSRF protection to use the given cookie name or header name,
   * or the default names (as described above) if not provided.
   */
  static withOptions(options: {
    cookieName?: string,
    headerName?: string,
  } = {}): ModuleWithProviders {
    return {
      ngModule: HttpClientXsrfModule,
      providers: [
        options.cookieName ? {provide: XSRF_COOKIE_NAME, useValue: options.cookieName} : [],
        options.headerName ? {provide: XSRF_HEADER_NAME, useValue: options.headerName} : [],
      ],
    };
  }
}

/**
 * `NgModule` which provides the `HttpClient` and associated services.
 *
 * Interceptors can be added to the chain behind `HttpClient` by binding them
 * to the multiprovider for `HTTP_INTERCEPTORS`.
 *
 * @experimental
 */
@NgModule({
  imports: [
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
  providers: [
    HttpClient,
    // HttpHandler is the backend + interceptors and is constructed
    // using the interceptingHandler factory function.
    {
      provide: HttpHandler,
      useFactory: interceptingHandler,
      deps: [HttpBackend, [new Optional(), new Inject(HTTP_INTERCEPTORS)]],
    },
    HttpXhrBackend,
    {provide: HttpBackend, useExisting: HttpXhrBackend},
    BrowserXhr,
    {provide: XhrFactory, useExisting: BrowserXhr},
  ],
})
export class HttpClientModule {
}

/**
 * `NgModule` which enables JSONP support in `HttpClient`.
 *
 * Without this module, Jsonp requests will reach the backend
 * with method JSONP, where they'll be rejected.
 *
 * @experimental
 */
@NgModule({
  providers: [
    JsonpClientBackend,
    {provide: JsonpCallbackContext, useFactory: jsonpCallbackContext},
    {provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true},
  ],
})
export class HttpClientJsonpModule {
}
