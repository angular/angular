/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {__platform_browser_private__} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';

import {HttpBackend} from './backend';
import {HttpInterceptor} from './interceptor';
import {HttpRequest, HttpResponse} from './request_response';

export const COOKIE_XSRF_HEADER = new InjectionToken<string>('COOKIE_XSRF_HEADER');
export const COOKIE_XSRF_NAME = new InjectionToken<string>('COOKIE_XSRF_NAME');

/**
 * `CookieXsrfInterceptor` sets up Cross Site Request Forgery (XSRF) protection for the application
 * using a cookie. See {@link https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)}
 * for more information on XSRF.
 *
 * Applications can configure custom cookie and header names by binding an instance of this class
 * with different `cookieName` and `headerName` values. See the main HTTP documentation for more
 * details.
 *
 * ### Example
 *
 * ```typescript
 * import {CookieXsrfInterceptor, COOKIE_XSRF_HEADER, COOKIE_XSRF_NAME} from '@angular/http';
 *
 * @NgModule({
 *   providers: [
 *     {provide: HTTP_INTERCEPTORS, useClass: CookieXsrfInterceptor, multi: true},
 *     // These are optional and override the default values:
 *     {provide: COOKIE_XSRF_HEADER, useValue: 'X-App-Xsrf-Token'},
 *     {provide: COOKIE_XSRF_NAME, useValue: 'MyAppXsrfCookie'},
 *   ],
 * })
 * export class AppXsrfModule {}
 * ```
 */
@Injectable()
export class CookieXsrfInterceptor implements HttpInterceptor {
  constructor(
      @Optional() @Inject(COOKIE_XSRF_HEADER) private headerName: string,
      @Optional() @Inject(COOKIE_XSRF_NAME) private cookieName: string) {
    if (!this.headerName) {
      this.headerName = 'X-XSRF-TOKEN';
    }
    if (!this.cookieName) {
      this.cookieName = 'XSRF-TOKEN';
    }
  }

  intercept(req: HttpRequest, next: HttpBackend): Observable<HttpResponse> {
    const xsrfToken = __platform_browser_private__.getDOM().getCookie(this.cookieName);
    if (xsrfToken) {
      req.headers.set(this.headerName, xsrfToken);
    }
    return next.handle(req);
  }
}
