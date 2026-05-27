/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PlatformLocation, XhrFactory} from '@angular/common';
import {
  ɵHTTP_ROOT_INTERCEPTOR_FNS as HTTP_ROOT_INTERCEPTOR_FNS,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
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

  let parsedUrl = new URL(request.url, baseUrl);

  if (parsedUrl.origin !== baseUrl.origin) {
    // If the request changed the origin, we check if it was authorized to do so.
    // Legitimate absolute URLs start with a scheme (e.g. http://) or are protocol-relative (//).
    // SSRF bypasses via backslashes (e.g. `/\attacker.com`, `\\attacker.com`) evade naive checks.
    const isProtocolRelative = /^\/\/[^/\\]/.test(trimmedUrl);
    if (!isProtocolRelative) {
      // Unrecognized structure that changed origin. Force it to be a local path.
      // A single leading slash is prepended so the value resolves as an absolute path
      // and cannot be reinterpreted as an absolute URL, e.g. when the scheme is hidden
      // with embedded tabs/newlines (`ht\ttp://attacker.com`) that the URL parser strips.
      parsedUrl = new URL('/' + trimmedUrl.replace(/^[/\\]+/, ''), baseUrl);
    }
  }

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
