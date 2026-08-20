/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  runInInjectionContext,
  Service,
} from '@angular/core';
import {Observable} from 'rxjs';
import {DOCUMENT, ɵparseCookieValue as parseCookieValue, PlatformLocation} from '../../index';

import type {HttpHandler} from './backend';
import {HttpContextToken} from './context';
import type {HttpHandlerFn, HttpInterceptor} from './interceptor';
import {HttpRequest} from './request';
import {HttpEvent} from './response';

export const XSRF_ENABLED = new InjectionToken<boolean>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'XSRF_ENABLED' : '',
  {
    factory: () => true,
  },
);

export const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_COOKIE_NAME = new InjectionToken<string>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'XSRF_COOKIE_NAME' : '',
  {
    // Providing a factory implies that the token is provided in root by default
    factory: () => XSRF_DEFAULT_COOKIE_NAME,
  },
);

export const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
export const XSRF_HEADER_NAME = new InjectionToken<string>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'XSRF_HEADER_NAME' : '',
  {
    factory: () => XSRF_DEFAULT_HEADER_NAME,
  },
);

type AddedXsrfHeader = Readonly<{name: string; value: string; origin: string}>;

/**
 * Tracks headers added by Angular's XSRF interceptor so that the terminal HTTP handler can
 * remove only Angular-owned token values if a downstream interceptor changes the request origin.
 */
const XSRF_ADDED_HEADERS = new HttpContextToken<readonly AddedXsrfHeader[]>(() => []);

function getSameOrigin(req: HttpRequest<unknown>): string | null {
  try {
    const locationHref = inject(PlatformLocation).href;
    const {origin: locationOrigin} = new URL(locationHref);
    // We can use `new URL` to normalize a relative URL like '//something.com' to
    // 'https://something.com' in order to make consistent same-origin comparisons.
    const {origin: requestOrigin} = new URL(req.url, locationOrigin);
    return locationOrigin === requestOrigin ? locationOrigin : null;
  } catch {
    // Treat invalid URLs as non-same-origin. This matches the interceptor's existing behavior of
    // not adding XSRF headers when the request origin cannot be validated.
    return null;
  }
}

function isRequestSameOrigin(req: HttpRequest<unknown>, origin: string): boolean {
  try {
    return new URL(req.url, origin).origin === origin;
  } catch {
    return false;
  }
}

/**
 * Removes Angular-added XSRF header values when the final request is no longer same-origin.
 *
 * This is invoked immediately before the terminal backend. The request context tracks only values
 * that Angular itself added, so user-provided values with the same header name are preserved.
 */
export function validateXsrfRequest(req: HttpRequest<unknown>): HttpRequest<unknown> {
  if (!req.context.has(XSRF_ADDED_HEADERS)) {
    return req;
  }

  let headers = req.headers;
  let changed = false;
  for (const {name, value, origin} of req.context.get(XSRF_ADDED_HEADERS)) {
    if (!isRequestSameOrigin(req, origin) && headers.getAll(name)?.includes(value)) {
      headers = headers.delete(name, value);
      changed = true;
    }
  }

  return changed ? req.clone({headers}) : req;
}

/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
@Service()
export class HttpXsrfCookieExtractor implements HttpXsrfTokenExtractor {
  private readonly cookieName = inject(XSRF_COOKIE_NAME);
  private readonly doc = inject(DOCUMENT);

  private lastCookieString: string = '';
  private lastToken: string | null = null;

  /**
   * @internal for testing
   */
  parseCount: number = 0;

  getToken(): string | null {
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
}

/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useExisting: HttpXsrfCookieExtractor})
export abstract class HttpXsrfTokenExtractor {
  /**
   * Get the XSRF token to use with an outgoing request.
   *
   * Will be called for every request, so the token may change between requests.
   */
  abstract getToken(): string | null;
}

export function xsrfInterceptorFn(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  // Skip both non-mutating requests
  // Non-mutating requests generally don't require a token.
  if (!inject(XSRF_ENABLED) || req.method === 'GET' || req.method === 'HEAD') {
    return next(req);
  }

  const origin = getSameOrigin(req);
  if (origin === null) {
    return next(req);
  }

  const token = inject(HttpXsrfTokenExtractor).getToken();
  const headerName = inject(XSRF_HEADER_NAME);

  // Be careful not to overwrite an existing header of the same name.
  if (token != null && !req.headers.has(headerName)) {
    req = req.clone({headers: req.headers.set(headerName, token)});
    req.context.set(XSRF_ADDED_HEADERS, [
      ...req.context.get(XSRF_ADDED_HEADERS),
      {name: headerName, value: token, origin},
    ]);
  }
  return next(req);
}

/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
@Injectable()
export class HttpXsrfInterceptor implements HttpInterceptor {
  private readonly injector = inject(EnvironmentInjector);

  intercept(initialRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return runInInjectionContext(this.injector, () =>
      xsrfInterceptorFn(initialRequest, (downstreamRequest) => next.handle(downstreamRequest)),
    );
  }
}
