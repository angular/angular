/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate, __param} from 'tslib';
import {DOCUMENT, ɵparseCookieValue as parseCookieValue} from '../../index';
import {Inject, inject, Injectable, InjectionToken, runInInjectionContext} from '@angular/core';
export const XSRF_ENABLED = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_ENABLED' : '',
  {
    factory: () => true,
  },
);
export const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_COOKIE_NAME = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_COOKIE_NAME' : '',
  {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_COOKIE_NAME,
  },
);
export const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
export const XSRF_HEADER_NAME = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_HEADER_NAME' : '',
  {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_HEADER_NAME,
  },
);
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
let HttpXsrfCookieExtractor = class HttpXsrfCookieExtractor {
  constructor(doc, cookieName) {
    this.doc = doc;
    this.cookieName = cookieName;
    this.lastCookieString = '';
    this.lastToken = null;
    /**
     * @internal for testing
     */
    this.parseCount = 0;
  }
  getToken() {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return null;
    }
    const cookieString = this.doc.cookie || '';
    if (cookieString !== this.lastCookieString) {
      this.parseCount++;
      this.lastToken = parseCookieValue(cookieString, this.cookieName);
      this.lastCookieString = cookieString;
    }
    return this.lastToken;
  }
};
HttpXsrfCookieExtractor = __decorate(
  [
    Injectable({providedIn: 'root'}),
    __param(0, Inject(DOCUMENT)),
    __param(1, Inject(XSRF_COOKIE_NAME)),
  ],
  HttpXsrfCookieExtractor,
);
export {HttpXsrfCookieExtractor};
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
let HttpXsrfTokenExtractor = class HttpXsrfTokenExtractor {};
HttpXsrfTokenExtractor = __decorate(
  [Injectable({providedIn: 'root', useExisting: HttpXsrfCookieExtractor})],
  HttpXsrfTokenExtractor,
);
export {HttpXsrfTokenExtractor};
export function xsrfInterceptorFn(req, next) {
  const lcUrl = req.url.toLowerCase();
  // Skip both non-mutating requests and absolute URLs.
  // Non-mutating requests don't require a token, and absolute URLs require special handling
  // anyway as the cookie set
  // on our origin is not the same as the token expected by another origin.
  if (
    !inject(XSRF_ENABLED) ||
    req.method === 'GET' ||
    req.method === 'HEAD' ||
    lcUrl.startsWith('http://') ||
    lcUrl.startsWith('https://')
  ) {
    return next(req);
  }
  const token = inject(HttpXsrfTokenExtractor).getToken();
  const headerName = inject(XSRF_HEADER_NAME);
  // Be careful not to overwrite an existing header of the same name.
  if (token != null && !req.headers.has(headerName)) {
    req = req.clone({headers: req.headers.set(headerName, token)});
  }
  return next(req);
}
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
let HttpXsrfInterceptor = class HttpXsrfInterceptor {
  constructor(injector) {
    this.injector = injector;
  }
  intercept(initialRequest, next) {
    return runInInjectionContext(this.injector, () =>
      xsrfInterceptorFn(initialRequest, (downstreamRequest) => next.handle(downstreamRequest)),
    );
  }
};
HttpXsrfInterceptor = __decorate([Injectable()], HttpXsrfInterceptor);
export {HttpXsrfInterceptor};
//# sourceMappingURL=xsrf.js.map
