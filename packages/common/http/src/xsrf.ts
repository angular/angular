/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵparseCookieValue as parseCookieValue} from '@angular/common';
import {Inject, Injectable, InjectionToken, PLATFORM_ID} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpHandler} from './backend';
import {HttpInterceptor} from './interceptor';
import {HttpRequest} from './request';
import {HttpEvent} from './response';

export const XSRF_COOKIE_NAME = new InjectionToken<string>('XSRF_COOKIE_NAME');
export const XSRF_HEADER_NAME = new InjectionToken<string>('XSRF_HEADER_NAME');

/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
export abstract class HttpXsrfTokenExtractor {
  /**
   * Get the XSRF token to use with an outgoing request.
   *
   * Will be called for every request, so the token may change between requests.
   */
  abstract getToken(): string|null;
}

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
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
@Injectable()
export class HttpXsrfInterceptor implements HttpInterceptor {
  constructor(
      private tokenService: HttpXsrfTokenExtractor,
      @Inject(XSRF_HEADER_NAME) private headerName: string) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const lcUrl = req.url.toLowerCase();
    // Skip both non-mutating requests and absolute URLs.
    // Non-mutating requests don't require a token, and absolute URLs require special handling
    // anyway as the cookie set
    // on our origin is not the same as the token expected by another origin.
    if (req.method === 'GET' || req.method === 'HEAD' || lcUrl.startsWith('http://') ||
        lcUrl.startsWith('https://')) {
      return next.handle(req);
    }
    const token = this.tokenService.getToken();

    // Be careful not to overwrite an existing header of the same name.
    if (token !== null && !req.headers.has(this.headerName)) {
      req = req.clone({headers: req.headers.set(this.headerName, token)});
    }
    return next.handle(req);
  }
}
