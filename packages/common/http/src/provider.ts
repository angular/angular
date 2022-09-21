/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '@angular/core';

import {HttpBackend, HttpHandler} from './backend';
import {HttpClient} from './client';
import {HTTP_INTERCEPTOR_FNS, HttpInterceptorHandler, legacyInterceptorFnFactory} from './interceptor';
import {jsonpInterceptorFn} from './jsonp';
import {HttpXhrBackend} from './xhr';
import {XSRF_COOKIE_NAME, XSRF_ENABLED, XSRF_HEADER_NAME, xsrfInterceptorFn} from './xsrf';

export enum HttpFeatureKind {
  LegacyInterceptors,
  CustomXsrfConfiguration,
  NoXsrfProtection,
  JsonpSupport,
}

export interface HttpFeature<KindT extends HttpFeatureKind> {
  ɵkind: KindT;
  ɵproviders: Provider[];
}


export function provideHttp(features: HttpFeature<HttpFeatureKind>[] = []): Provider[] {
  if (ngDevMode) {
    const featureKinds = new Set(features.map(f => f.ɵkind));
    if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) &&
        featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
      throw new Error('Cannot both disable and configure XSRF protection.');
    }
  }

  const providers: Provider[] = [
    HttpClient, HttpXhrBackend, HttpInterceptorHandler,
    {provide: HttpHandler, useExisting: HttpInterceptorHandler},
    {provide: HttpBackend, useExisting: HttpXhrBackend}, {
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: xsrfInterceptorFn,
      multi: true,
    }
  ];

  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }

  return providers;
}

export function withLegacyInterceptors(): HttpFeature<HttpFeatureKind.LegacyInterceptors> {
  return {
    ɵkind: HttpFeatureKind.LegacyInterceptors,
    ɵproviders: [{
      provide: HTTP_INTERCEPTOR_FNS,
      useFactory: legacyInterceptorFnFactory,
      multi: true,
    }],
  };
}

export function withXsrfConfiguration(
    {cookieName, headerName}: {cookieName?: string, headerName?: string}):
    HttpFeature<HttpFeatureKind.CustomXsrfConfiguration> {
  const providers: Provider[] = [];
  if (cookieName !== undefined) {
    providers.push({provide: XSRF_COOKIE_NAME, useValue: cookieName});
  }
  if (headerName !== undefined) {
    providers.push({provide: XSRF_HEADER_NAME, useValue: headerName});
  }

  return {
    ɵkind: HttpFeatureKind.CustomXsrfConfiguration,
    ɵproviders: providers,
  };
}

export function withNoXsrfProtection(): HttpFeature<HttpFeatureKind.NoXsrfProtection> {
  return {
    ɵkind: HttpFeatureKind.NoXsrfProtection,
    ɵproviders: [{
      provide: XSRF_ENABLED,
      useValue: false,
    }],
  };
}

export function withJsonpSupport(): HttpFeature<HttpFeatureKind.JsonpSupport> {
  return {
    ɵkind: HttpFeatureKind.JsonpSupport,
    ɵproviders: [{
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: jsonpInterceptorFn /* insert jsonp interceptor */,
      multi: true,
    }],
  };
}
