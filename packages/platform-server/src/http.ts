/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PlatformLocation, XhrFactory} from '@angular/common';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  ɵHTTP_ROOT_INTERCEPTOR_FNS as HTTP_ROOT_INTERCEPTOR_FNS,
} from '@angular/common/http';
import {inject, Injectable, Provider, ɵRuntimeError as RuntimeError} from '@angular/core';
import {Observable} from 'rxjs';

import {RuntimeErrorCode} from './errors';
import {parseUrl} from './url';

@Injectable()
/**
 * @deprecated Use the HttpClient fetch backend (by enabling `withFetch()`) instead.
 * XHR support in `@angular/platform-server` is deprecated because the underlying `xhr2`
 * library does not safely handle redirects (e.g. it can forward `Authorization` headers
 * on cross-origin redirects and is susceptible to denial-of-service (DoS) via redirect loops).
 */
export class ServerXhr implements XhrFactory {
  private xhrImpl: typeof import('xhr2') | undefined;

  // The `xhr2` dependency has a side-effect of accessing and modifying a
  // global scope. Loading `xhr2` dynamically allows us to delay the loading
  // and start the process once the global scope is established by the underlying
  // server platform (via shims, etc).
  private async ɵloadImpl(): Promise<void> {
    if (!this.xhrImpl) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          'XHR support in `@angular/platform-server` is deprecated and will be removed ' +
            'in a future version of Angular. It has known security and performance issues in server ' +
            'environments, such as forwarding `Authorization` headers on cross-origin ' +
            'redirects and susceptibility to denial-of-service (DoS) via redirect loops. ' +
            'Please enable the HttpClient fetch backend instead by using `withFetch()`.',
        );
      }

      const {default: xhr} = await import('xhr2');
      this.xhrImpl = xhr;
    }
  }

  build(): XMLHttpRequest {
    const impl = this.xhrImpl;
    if (!impl) {
      throw new RuntimeError(
        RuntimeErrorCode.XHR_NOT_LOADED,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          'Unexpected state in ServerXhr: XHR implementation is not loaded.',
      );
    }

    return new impl.XMLHttpRequest();
  }
}

/**
 * Regex to match a URL schema.
 */
const URL_SCHEMA_REGEXP = /^(?:[a-zA-Z][a-zA-Z0-9+\-.]*:)/;

function relativeUrlsTransformerInterceptorFn(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const trimmedUrl = request.url.trim();
  if (URL_SCHEMA_REGEXP.test(trimmedUrl)) {
    // URLs with a schema should be left unchanged.
    return next(request);
  }

  const platformLocation = inject(PlatformLocation);
  const {href, protocol, hostname, port} = platformLocation;
  if (!protocol.startsWith('http')) {
    return next(request);
  }

  let urlPrefix = `${protocol}//${hostname}`;
  if (port) {
    urlPrefix += `:${port}`;
  }

  const baseHref = platformLocation.getBaseHrefFromDOM() || href;
  const baseUrl = new URL(baseHref, urlPrefix);
  const parsedUrl = parseUrl(request.url, baseUrl, {
    allowProtocolRelative: true,
  });

  return next(request.clone({url: parsedUrl.toString()}));
}

export const SERVER_HTTP_PROVIDERS: Provider[] = [
  {provide: XhrFactory, useClass: ServerXhr},
  {
    provide: HTTP_ROOT_INTERCEPTOR_FNS,
    useValue: relativeUrlsTransformerInterceptorFn,
    multi: true,
  },
];
