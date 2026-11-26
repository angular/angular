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
import {inject, Injectable, Provider, ɵRuntimeError as RuntimeError} from '@angular/core';
import {Observable} from 'rxjs';

import {RuntimeErrorCode} from './errors';
import {HTTP_OR_HTTPS_NO_AUTHORITY_REGEXP, resolveUrl} from './url';

@Injectable()
/**
 * @deprecated Use the HttpClient fetch backend instead. Intent to remove in Angular 23.
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
            'in Angular 23. It has known security and performance issues in server ' +
            'environments, such as forwarding `Authorization` headers on cross-origin ' +
            'redirects and susceptibility to denial-of-service (DoS) via redirect loops. ' +
            'Please use the HttpClient fetch backend instead, which is the default since Angular 22.',
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
 * The HTTP header added to outgoing `HttpClient` requests targeting the host of the page being
 * rendered on the server.
 *
 * @note Used also in `@angular/ssr`.
 * @private
 */
export const SSR_REQUEST_HEADER = 'x-angular-ssr-request';

/**
 * Checks whether an incoming HTTP `Request` carries the {@link SSR_REQUEST_HEADER} header,
 * indicating it was sent by an Angular application while rendering on the server.
 *
 * @param request - The incoming `Request` object to check.
 * @returns `true` if the request carries {@link SSR_REQUEST_HEADER}.
 * @note Used also in `@angular/ssr`.
 * @private
 */
export function isSsrRequest(request: Request): boolean {
  return Boolean(request?.headers?.has?.(SSR_REQUEST_HEADER));
}

/**
 * Regex to match a URL schema.
 */
const URL_SCHEMA_REGEXP = /^(?:[a-zA-Z][a-zA-Z0-9+\-.]*:)/;

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function stripTrailingDot(hostname: string): string {
  return hostname.endsWith('.') ? hostname.slice(0, -1) : hostname;
}

function isDefaultHttpPort(url: URL): boolean {
  return url.port === '' || url.port === '80' || url.port === '443';
}

function isSameServerHost(targetUrl: URL, serverUrl: URL): boolean {
  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return false;
  }

  return (
    stripTrailingDot(targetUrl.hostname) === stripTrailingDot(serverUrl.hostname) &&
    (targetUrl.port === serverUrl.port ||
      (isDefaultHttpPort(targetUrl) && isDefaultHttpPort(serverUrl)))
  );
}

function serverHttpInterceptorFn(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const isAbsoluteUrl =
    URL_SCHEMA_REGEXP.test(request.url) && !HTTP_OR_HTTPS_NO_AUTHORITY_REGEXP.test(request.url);

  const platformLocation = inject(PlatformLocation, {optional: true});
  if (!platformLocation) {
    return next(request);
  }

  const {href, protocol, hostname, port} = platformLocation;
  if (protocol !== 'http:' && protocol !== 'https:') {
    return next(request);
  }

  let urlPrefix = `${protocol}//${hostname}`;
  if (port) {
    urlPrefix += `:${port}`;
  }

  const serverUrl = parseUrl(urlPrefix);
  if (!serverUrl) {
    return next(request);
  }

  let parsedUrl: URL | null;
  let updatedUrl: string | undefined;

  if (isAbsoluteUrl) {
    parsedUrl = parseUrl(request.url);
  } else {
    const baseHref = platformLocation.getBaseHrefFromDOM() || href;
    const baseUrl = new URL(baseHref, urlPrefix);
    parsedUrl = resolveUrl(request.url, baseUrl, {
      allowProtocolRelative: true,
    });
    updatedUrl = parsedUrl.toString();
  }

  const shouldMarkSsrRequest =
    parsedUrl !== null &&
    isSameServerHost(parsedUrl, serverUrl) &&
    !request.headers.has(SSR_REQUEST_HEADER);

  if (updatedUrl === undefined && !shouldMarkSsrRequest) {
    return next(request);
  }

  return next(
    request.clone({
      ...(updatedUrl !== undefined ? {url: updatedUrl} : undefined),
      ...(shouldMarkSsrRequest ? {setHeaders: {[SSR_REQUEST_HEADER]: '1'}} : undefined),
    }),
  );
}

export const SERVER_HTTP_PROVIDERS: Provider[] = [
  {provide: XhrFactory, useClass: ServerXhr},
  {
    provide: HTTP_ROOT_INTERCEPTOR_FNS,
    useValue: serverHttpInterceptorFn,
    multi: true,
  },
];
