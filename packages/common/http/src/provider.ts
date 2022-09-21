/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Provider} from '@angular/core';

import {HttpBackend, HttpHandler} from './backend';
import {HttpClient} from './client';
import {HTTP_INTERCEPTOR_FNS, HttpInterceptorFn, HttpInterceptorHandler, legacyInterceptorFnFactory} from './interceptor';
import {jsonpCallbackContext, JsonpCallbackContext, JsonpClientBackend, jsonpInterceptorFn} from './jsonp';
import {HttpXhrBackend} from './xhr';
import {HttpXsrfCookieExtractor, HttpXsrfTokenExtractor, XSRF_COOKIE_NAME, XSRF_ENABLED, XSRF_HEADER_NAME, xsrfInterceptorFn} from './xsrf';

export enum HttpFeatureKind {
  Interceptors,
  LegacyInterceptors,
  CustomXsrfConfiguration,
  NoXsrfProtection,
  JsonpSupport,
}

export interface HttpFeature<KindT extends HttpFeatureKind> {
  ɵkind: KindT;
  ɵproviders: Provider[];
}

function makeHttpFeature<KindT extends HttpFeatureKind>(
    kind: KindT, providers: Provider[]): HttpFeature<KindT> {
  return {
    ɵkind: kind,
    ɵproviders: providers,
  };
}


export function provideHttpClient(...features: HttpFeature<HttpFeatureKind>[]): Provider[] {
  if (ngDevMode) {
    const featureKinds = new Set(features.map(f => f.ɵkind));
    if (featureKinds.has(HttpFeatureKind.NoXsrfProtection) &&
        featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)) {
      throw new Error(
          ngDevMode ?
              `Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.` :
              '');
    }
  }

  const providers: Provider[] = [
    HttpClient,
    HttpXhrBackend,
    HttpInterceptorHandler,
    {provide: HttpHandler, useExisting: HttpInterceptorHandler},
    {provide: HttpBackend, useExisting: HttpXhrBackend},
    {
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: xsrfInterceptorFn,
      multi: true,
    },
    {provide: XSRF_ENABLED, useValue: true},
    {provide: HttpXsrfTokenExtractor, useClass: HttpXsrfCookieExtractor},
  ];

  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }

  return providers;
}

export function withInterceptors(interceptorFns: HttpInterceptorFn[]):
    HttpFeature<HttpFeatureKind.Interceptors> {
  return makeHttpFeature(HttpFeatureKind.Interceptors, interceptorFns.map(interceptorFn => {
    return {
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: interceptorFn,
      multi: true,
    };
  }));
}

const LEGACY_INTERCEPTOR_FN = new InjectionToken<HttpInterceptorFn>('LEGACY_INTERCEPTOR_FN');

export function withLegacyInterceptors(): HttpFeature<HttpFeatureKind.LegacyInterceptors> {
  // Note: the legacy interceptor function is provided here via an intermediate token
  // (`LEGACY_INTERCEPTOR_FN`), using a pattern which guarantees that if these providers are
  // included multiple times, all of the multi-provider entries will have the same instance of the
  // interceptor function. That way, the `HttpINterceptorHandler` will dedup them and legacy
  // interceptors will not run multiple times.
  return makeHttpFeature(HttpFeatureKind.LegacyInterceptors, [
    {
      provide: LEGACY_INTERCEPTOR_FN,
      useFactory: legacyInterceptorFnFactory,
    },
    {
      provide: HTTP_INTERCEPTOR_FNS,
      useExisting: LEGACY_INTERCEPTOR_FN,
      multi: true,
    }
  ]);
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

  return makeHttpFeature(HttpFeatureKind.CustomXsrfConfiguration, providers);
}

export function withNoXsrfProtection(): HttpFeature<HttpFeatureKind.NoXsrfProtection> {
  return makeHttpFeature(HttpFeatureKind.NoXsrfProtection, [
    {
      provide: XSRF_ENABLED,
      useValue: false,
    },
  ]);
}

export function withJsonpSupport(): HttpFeature<HttpFeatureKind.JsonpSupport> {
  return makeHttpFeature(HttpFeatureKind.JsonpSupport, [
    JsonpClientBackend,
    {provide: JsonpCallbackContext, useFactory: jsonpCallbackContext},
    {provide: HTTP_INTERCEPTOR_FNS, useValue: jsonpInterceptorFn, multi: true},
  ]);
}
