/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ModuleWithProviders, NgModule} from '@angular/core';

import {HTTP_INTERCEPTORS} from './interceptor';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withJsonpSupport,
  withNoXsrfProtection,
  withXsrfConfiguration,
} from './provider';
import {
  HttpXsrfCookieExtractor,
  HttpXsrfInterceptor,
  HttpXsrfTokenExtractor,
  XSRF_DEFAULT_COOKIE_NAME,
  XSRF_DEFAULT_HEADER_NAME,
  XSRF_ENABLED,
} from './xsrf';

/**
 * Configures XSRF protection support for outgoing requests.
 *
 * For a server that supports a cookie-based XSRF protection system,
 * use directly to configure XSRF protection with the correct
 * cookie and header names.
 *
 * If no names are supplied, the default cookie name is `XSRF-TOKEN`
 * and the default header name is `X-XSRF-TOKEN`.
 *
 * @publicApi
 * @deprecated Use withXsrfConfiguration({cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN'}) as
 *     providers instead or `withNoXsrfProtection` if you want to disabled XSRF protection.
 */
@NgModule({
  providers: [
    HttpXsrfInterceptor,
    {provide: HTTP_INTERCEPTORS, useExisting: HttpXsrfInterceptor, multi: true},
    {provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor},
    withXsrfConfiguration({
      cookieName: XSRF_DEFAULT_COOKIE_NAME,
      headerName: XSRF_DEFAULT_HEADER_NAME,
    }).ɵproviders,
    {provide: XSRF_ENABLED, useValue: true},
  ],
})
export class HttpClientXsrfModule {
  /**
   * Disable the default XSRF protection.
   */
  static disable(): ModuleWithProviders<HttpClientXsrfModule> {
    return {
      ngModule: HttpClientXsrfModule,
      providers: [withNoXsrfProtection().ɵproviders],
    };
  }

  /**
   * Configure XSRF protection.
   * @param options An object that can specify either or both
   * cookie name or header name.
   * - Cookie name default is `XSRF-TOKEN`.
   * - Header name default is `X-XSRF-TOKEN`.
   *
   */
  static withOptions(
    options: {
      cookieName?: string;
      headerName?: string;
    } = {},
  ): ModuleWithProviders<HttpClientXsrfModule> {
    return {
      ngModule: HttpClientXsrfModule,
      providers: withXsrfConfiguration(options).ɵproviders,
    };
  }
}

/**
 * Configures the dependency injector for `HttpClient`
 * with supporting services for XSRF. Automatically imported by `HttpClientModule`.
 *
 * You can add interceptors to the chain behind `HttpClient` by binding them to the
 * multiprovider for built-in DI token `HTTP_INTERCEPTORS`.
 *
 * @publicApi
 * @deprecated use `provideHttpClient(withInterceptorsFromDi())` as providers instead
 */
@NgModule({
  /**
   * Configures the dependency injector where it is imported
   * with supporting services for HTTP communications.
   */
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class HttpClientModule {}

/**
 * Configures the dependency injector for `HttpClient`
 * with supporting services for JSONP.
 * Without this module, Jsonp requests reach the backend
 * with method JSONP, where they are rejected.
 *
 * @publicApi
 * @deprecated `withJsonpSupport()` as providers instead
 */
@NgModule({
  providers: [withJsonpSupport().ɵproviders],
})
export class HttpClientJsonpModule {}
