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
  ɵSERVER_XHR2_LOADER as SERVER_XHR2_LOADER,
} from '@angular/common/http';
import {inject, Injectable, Provider} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ServerXhr implements XhrFactory {
  private readonly loader = inject(SERVER_XHR2_LOADER, {optional: true});
  private xhrImpl: any;

  // `xhr2` has a side-effect of accessing and modifying the global scope. Lazy-loading
  // it via the injected loader delays that until the server platform (via shims, etc.)
  // has established the global scope. The loader is provided by `withXhr()` only in
  // server mode, so `import('xhr2')` is absent from SSR bundles that use the default
  // FetchBackend — a requirement for bundlers in restricted environments such as
  // Cloudflare Workers or V8 isolates.
  async ɵloadImpl(): Promise<void> {
    if (!this.xhrImpl && this.loader) {
      this.xhrImpl = await this.loader();
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

  let urlPrefix = `${protocol}//${hostname}`;
  if (port) {
    urlPrefix += `:${port}`;
  }

  const baseHref = platformLocation.getBaseHrefFromDOM() || href;
  const baseUrl = new URL(baseHref, urlPrefix);
  const newUrl = new URL(request.url, baseUrl).toString();

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
