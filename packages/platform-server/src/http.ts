/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation, XhrFactory} from '@angular/common';
import {HttpBackend, HttpEvent, HttpHandler, HttpRequest, ɵHttpInterceptorHandler as HttpInterceptorHandler} from '@angular/common/http';
import {EnvironmentInjector, Inject, inject, Injectable, Provider} from '@angular/core';
import {Observable} from 'rxjs';
import * as xhr2 from 'xhr2';

import {INITIAL_CONFIG} from './tokens';

// @see https://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#URI-syntax
const isAbsoluteUrl = /^[a-zA-Z\-\+.]+:\/\//;

@Injectable()
export class ServerXhr implements XhrFactory {
  build(): XMLHttpRequest {
    return new xhr2.XMLHttpRequest();
  }
}

// TODO(alanagius): this logic should be re-evauted and moved into `withTransferCache` in
// `@angular/common/http` if still needed.
@Injectable()
export class ServerHttpInterceptorHandler extends HttpInterceptorHandler {
  private readonly platformLocation = inject(PlatformLocation);
  private readonly config = inject(INITIAL_CONFIG);

  constructor() {
    const backend = inject(HttpBackend);
    const injector = inject(EnvironmentInjector);
    super(backend, injector);
  }

  override handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    const {href, protocol, hostname, port} = this.platformLocation;
    if (this.config.useAbsoluteUrl && !isAbsoluteUrl.test(request.url) &&
        isAbsoluteUrl.test(href)) {
      const baseHref = this.platformLocation.getBaseHrefFromDOM() || href;
      const urlPrefix = `${protocol}//${hostname}` + (port ? `:${port}` : '');
      const baseUrl = new URL(baseHref, urlPrefix);
      const url = new URL(request.url, baseUrl);
      return super.handle(request.clone({url: url.toString()}));
    }

    return super.handle(request);
  }
}

export const SERVER_HTTP_PROVIDERS: Provider[] = [
  {provide: XhrFactory, useClass: ServerXhr}, {
    provide: HttpHandler,
    useClass: ServerHttpInterceptorHandler,
    deps: [PlatformLocation, INITIAL_CONFIG, HttpBackend, EnvironmentInjector]
  }
];
