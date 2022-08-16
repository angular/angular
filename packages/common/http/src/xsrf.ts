/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵparseCookieValue as parseCookieValue} from '@angular/common';
import {inject, Inject, Injectable, InjectionToken, PLATFORM_ID} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpHandlerFn} from './interceptor_fn';
import {HttpRequest} from './request';
import {HttpEvent} from './response';

export const XSRF_COOKIE_NAME = new InjectionToken<string>('XSRF_COOKIE_NAME', {
  providedIn: 'root',
  factory: () => 'XSRF-TOKEN',
});

export const XSRF_HEADER_NAME = new InjectionToken<string>('XSRF_HEADER_NAME', {
  providedIn: 'root',
  factory: () => 'X-XSRF-TOKEN',
});

export const XSRF_ENABLED = new InjectionToken<boolean>('XSRF_ENABLED', {
  providedIn: 'root',
  factory: () => true,
});


/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
@Injectable()
export class HttpXsrfCookieExtractor implements HttpXsrfTokenExtractor {
  private lastCookieString: string = '';
  private lastToken: string|null = null;

  /**
   * @internal for testing
   */
  parseCount: number = 0;

  constructor(
      @Inject(DOCUMENT) private doc: any, @Inject(PLATFORM_ID) private platform: string,
      @Inject(XSRF_COOKIE_NAME) private cookieName: string) {}

  getToken(): string|null {
    if (this.platform === 'server') {
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
}

/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
@Injectable({
  providedIn: 'root',
  useClass: HttpXsrfCookieExtractor,
})
export abstract class HttpXsrfTokenExtractor {
  /**
   * Get the XSRF token to use with an outgoing request.
   *
   * Will be called for every request, so the token may change between requests.
   */
  abstract getToken(): string|null;
}

export function shouldXsrfProtectRequest(req: HttpRequest<unknown>): boolean {
  if (!inject(XSRF_ENABLED)) {
    return false;
  }

  const lcUrl = req.url.toLowerCase();
  // Skip both non-mutating requests and absolute URLs.
  // Non-mutating requests don't require a token, and absolute URLs require special handling
  // anyway as the cookie set
  // on our origin is not the same as the token expected by another origin.
  if (req.method === 'GET' || req.method === 'HEAD' || lcUrl.startsWith('http://') ||
      lcUrl.startsWith('https://')) {
    return false;
  }
  return true;
}

export function xsrfInterceptor(
    req: HttpRequest<unknown>, handle: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!shouldXsrfProtectRequest(req)) {
    return handle(req);
  }
  const token = inject(HttpXsrfTokenExtractor).getToken();
  const headerName = inject(XSRF_HEADER_NAME);

  // Be careful not to overwrite an existing header of the same name.
  if (token !== null && !req.headers.has(headerName)) {
    req = req.clone({headers: req.headers.set(headerName, token)});
  }
  return handle(req);
}
