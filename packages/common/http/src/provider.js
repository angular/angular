/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject, InjectionToken, makeEnvironmentProviders} from '@angular/core';
import {HttpBackend, HttpHandler, HttpInterceptorHandler} from './backend';
import {HttpClient} from './client';
import {FETCH_BACKEND, FetchBackend} from './fetch';
import {HTTP_INTERCEPTOR_FNS, legacyInterceptorFnFactory} from './interceptor';
import {
  jsonpCallbackContext,
  JsonpCallbackContext,
  JsonpClientBackend,
  jsonpInterceptorFn,
} from './jsonp';
import {HttpXhrBackend} from './xhr';
import {XSRF_COOKIE_NAME, XSRF_ENABLED, XSRF_HEADER_NAME, xsrfInterceptorFn} from './xsrf';
/**
 * Identifies a particular kind of `HttpFeature`.
 *
 * @publicApi
 */
export var HttpFeatureKind;
(function (HttpFeatureKind) {
  HttpFeatureKind[(HttpFeatureKind['Interceptors'] = 0)] = 'Interceptors';
  HttpFeatureKind[(HttpFeatureKind['LegacyInterceptors'] = 1)] = 'LegacyInterceptors';
  HttpFeatureKind[(HttpFeatureKind['CustomXsrfConfiguration'] = 2)] = 'CustomXsrfConfiguration';
  HttpFeatureKind[(HttpFeatureKind['NoXsrfProtection'] = 3)] = 'NoXsrfProtection';
  HttpFeatureKind[(HttpFeatureKind['JsonpSupport'] = 4)] = 'JsonpSupport';
  HttpFeatureKind[(HttpFeatureKind['RequestsMadeViaParent'] = 5)] = 'RequestsMadeViaParent';
  HttpFeatureKind[(HttpFeatureKind['Fetch'] = 6)] = 'Fetch';
})(HttpFeatureKind || (HttpFeatureKind = {}));
function makeHttpFeature(kind, providers) {
  return {
    ɵkind: kind,
    ɵproviders: providers,
  };
}
/**
 * Configures Angular's `HttpClient` service to be available for injection.
 *
 * By default, `HttpClient` will be configured for injection with its default options for XSRF
 * protection of outgoing requests. Additional configuration options can be provided by passing
 * feature functions to `provideHttpClient`. For example, HTTP interceptors can be added using the
 * `withInterceptors(...)` feature.
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 * It's strongly recommended to enable
 * [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for applications that use
 * Server-Side Rendering for better performance and compatibility. To enable `fetch`, add
 * `withFetch()` feature to the `provideHttpClient()` call at the root of the application:
 *
 * ```ts
 * provideHttpClient(withFetch());
 * ```
 *
 * </div>
 *
 * @see {@link withInterceptors}
 * @see {@link withInterceptorsFromDi}
 * @see {@link withXsrfConfiguration}
 * @see {@link withNoXsrfProtection}
 * @see {@link withJsonpSupport}
 * @see {@link withRequestsMadeViaParent}
 * @see {@link withFetch}
 */
export function provideHttpClient(...features) {
  if (ngDevMode) {
    const featureKinds = new Set(features.map((f) => f.ɵkind));
    if (
      featureKinds.has(HttpFeatureKind.NoXsrfProtection) &&
      featureKinds.has(HttpFeatureKind.CustomXsrfConfiguration)
    ) {
      throw new Error(
        ngDevMode
          ? `Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.`
          : '',
      );
    }
  }
  const providers = [
    HttpClient,
    HttpInterceptorHandler,
    {provide: HttpHandler, useExisting: HttpInterceptorHandler},
    {
      provide: HttpBackend,
      useFactory: () => {
        return inject(FETCH_BACKEND, {optional: true}) ?? inject(HttpXhrBackend);
      },
    },
    {
      provide: HTTP_INTERCEPTOR_FNS,
      useValue: xsrfInterceptorFn,
      multi: true,
    },
  ];
  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }
  return makeEnvironmentProviders(providers);
}
/**
 * Adds one or more functional-style HTTP interceptors to the configuration of the `HttpClient`
 * instance.
 *
 * @see {@link HttpInterceptorFn}
 * @see {@link provideHttpClient}
 * @publicApi
 */
export function withInterceptors(interceptorFns) {
  return makeHttpFeature(
    HttpFeatureKind.Interceptors,
    interceptorFns.map((interceptorFn) => {
      return {
        provide: HTTP_INTERCEPTOR_FNS,
        useValue: interceptorFn,
        multi: true,
      };
    }),
  );
}
const LEGACY_INTERCEPTOR_FN = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'LEGACY_INTERCEPTOR_FN' : '',
);
/**
 * Includes class-based interceptors configured using a multi-provider in the current injector into
 * the configured `HttpClient` instance.
 *
 * Prefer `withInterceptors` and functional interceptors instead, as support for DI-provided
 * interceptors may be phased out in a later release.
 *
 * @see {@link HttpInterceptor}
 * @see {@link HTTP_INTERCEPTORS}
 * @see {@link provideHttpClient}
 */
export function withInterceptorsFromDi() {
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
    },
  ]);
}
/**
 * Customizes the XSRF protection for the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withNoXsrfProtection` feature.
 *
 * @see {@link provideHttpClient}
 */
export function withXsrfConfiguration({cookieName, headerName}) {
  const providers = [];
  if (cookieName !== undefined) {
    providers.push({provide: XSRF_COOKIE_NAME, useValue: cookieName});
  }
  if (headerName !== undefined) {
    providers.push({provide: XSRF_HEADER_NAME, useValue: headerName});
  }
  return makeHttpFeature(HttpFeatureKind.CustomXsrfConfiguration, providers);
}
/**
 * Disables XSRF protection in the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withXsrfConfiguration` feature.
 *
 * @see {@link provideHttpClient}
 */
export function withNoXsrfProtection() {
  return makeHttpFeature(HttpFeatureKind.NoXsrfProtection, [
    {
      provide: XSRF_ENABLED,
      useValue: false,
    },
  ]);
}
/**
 * Add JSONP support to the configuration of the current `HttpClient` instance.
 *
 * @see {@link provideHttpClient}
 */
export function withJsonpSupport() {
  return makeHttpFeature(HttpFeatureKind.JsonpSupport, [
    JsonpClientBackend,
    {provide: JsonpCallbackContext, useFactory: jsonpCallbackContext},
    {provide: HTTP_INTERCEPTOR_FNS, useValue: jsonpInterceptorFn, multi: true},
  ]);
}
/**
 * Configures the current `HttpClient` instance to make requests via the parent injector's
 * `HttpClient` instead of directly.
 *
 * By default, `provideHttpClient` configures `HttpClient` in its injector to be an independent
 * instance. For example, even if `HttpClient` is configured in the parent injector with
 * one or more interceptors, they will not intercept requests made via this instance.
 *
 * With this option enabled, once the request has passed through the current injector's
 * interceptors, it will be delegated to the parent injector's `HttpClient` chain instead of
 * dispatched directly, and interceptors in the parent configuration will be applied to the request.
 *
 * If there are several `HttpClient` instances in the injector hierarchy, it's possible for
 * `withRequestsMadeViaParent` to be used at multiple levels, which will cause the request to
 * "bubble up" until either reaching the root level or an `HttpClient` which was not configured with
 * this option.
 *
 * @see {@link provideHttpClient}
 * @publicApi 19.0
 */
export function withRequestsMadeViaParent() {
  return makeHttpFeature(HttpFeatureKind.RequestsMadeViaParent, [
    {
      provide: HttpBackend,
      useFactory: () => {
        const handlerFromParent = inject(HttpHandler, {skipSelf: true, optional: true});
        if (ngDevMode && handlerFromParent === null) {
          throw new Error(
            'withRequestsMadeViaParent() can only be used when the parent injector also configures HttpClient',
          );
        }
        return handlerFromParent;
      },
    },
  ]);
}
/**
 * Configures the current `HttpClient` instance to make requests using the fetch API.
 *
 * Note: The Fetch API doesn't support progress report on uploads.
 *
 * @publicApi
 */
export function withFetch() {
  return makeHttpFeature(HttpFeatureKind.Fetch, [
    FetchBackend,
    {provide: FETCH_BACKEND, useExisting: FetchBackend},
    {provide: HttpBackend, useExisting: FetchBackend},
  ]);
}
//# sourceMappingURL=provider.js.map
