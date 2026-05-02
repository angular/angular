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
import {inject, Injectable, Provider} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ServerXhr implements XhrFactory {
  private xhrImpl: typeof import('xhr2') | undefined;

  // The `xhr2` dependency has a side-effect of accessing and modifying a
  // global scope. Loading `xhr2` dynamically allows us to delay the loading
  // and start the process once the global scope is established by the underlying
  // server platform (via shims, etc).
  private async ɵloadImpl(): Promise<void> {
    if (!this.xhrImpl) {
      const {default: xhr} = await import('xhr2');
      this.xhrImpl = xhr;
    }
  }

  build(): XMLHttpRequest {
    const impl = this.xhrImpl;
    if (!impl) {
      throw new Error('Unexpected state in ServerXhr: XHR implementation is not loaded.');
    }

    return new impl.XMLHttpRequest();
  }
}

function relativeUrlsTransformerInterceptorFn(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const platformLocation = inject(PlatformLocation);
  const {href, protocol, hostname, port} = platformLocation;
  if (!protocol.startsWith('http')) {
    return next(request);
  }

  const requestUrl = request.url;

  // Reject protocol-relative URLs (e.g., //evil.com) and backslash-prefixed
  // URLs (e.g., \evil.com) to prevent SSRF attacks. These URLs can resolve to
  // external domains when the URL constructor processes them, potentially
  // allowing attackers to make the server make requests to arbitrary domains.
  if (requestUrl.startsWith('//') || requestUrl.startsWith('\\')) {
    return next(request);
  }

  let urlPrefix = `${protocol}//${hostname}`;
  if (port) {
    urlPrefix += `:${port}`;
  }

  const baseHref = platformLocation.getBaseHrefFromDOM() || href;

  // Use URL.canParse for absolute URLs to avoid using a base URL,
  // similar to the fix in location.ts parseUrl function.
  let newUrl: string;
  if (URL.canParse(requestUrl)) {
    newUrl = new URL(requestUrl).toString();
  } else {
    // For relative URLs, construct the base URL and resolve.
    const baseUrl = new URL(baseHref, urlPrefix);
    newUrl = new URL(requestUrl, baseUrl).toString();
  }

  return next(request.clone({url: newUrl}));
}

export const SERVER_HTTP_PROVIDERS: Provider[] = [
  {provide: XhrFactory, useClass: ServerXhr},
  {
    provide: HTTP_ROOT_INTERCEPTOR_FNS,
    useValue: relativeUrlsTransformerInterceptorFn,
    multi: true,
  },
];
