/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentProviders, Provider } from '@angular/core';
import { HttpInterceptorFn } from './interceptor';
/**
 * Identifies a particular kind of `HttpFeature`.
 *
 * @publicApi
 */
export declare enum HttpFeatureKind {
    Interceptors = 0,
    LegacyInterceptors = 1,
    CustomXsrfConfiguration = 2,
    NoXsrfProtection = 3,
    JsonpSupport = 4,
    RequestsMadeViaParent = 5,
    Fetch = 6
}
/**
 * A feature for use when configuring `provideHttpClient`.
 *
 * @publicApi
 */
export interface HttpFeature<KindT extends HttpFeatureKind> {
    ɵkind: KindT;
    ɵproviders: Provider[];
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
export declare function provideHttpClient(...features: HttpFeature<HttpFeatureKind>[]): EnvironmentProviders;
/**
 * Adds one or more functional-style HTTP interceptors to the configuration of the `HttpClient`
 * instance.
 *
 * @see {@link HttpInterceptorFn}
 * @see {@link provideHttpClient}
 * @publicApi
 */
export declare function withInterceptors(interceptorFns: HttpInterceptorFn[]): HttpFeature<HttpFeatureKind.Interceptors>;
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
export declare function withInterceptorsFromDi(): HttpFeature<HttpFeatureKind.LegacyInterceptors>;
/**
 * Customizes the XSRF protection for the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withNoXsrfProtection` feature.
 *
 * @see {@link provideHttpClient}
 */
export declare function withXsrfConfiguration({ cookieName, headerName, }: {
    cookieName?: string;
    headerName?: string;
}): HttpFeature<HttpFeatureKind.CustomXsrfConfiguration>;
/**
 * Disables XSRF protection in the configuration of the current `HttpClient` instance.
 *
 * This feature is incompatible with the `withXsrfConfiguration` feature.
 *
 * @see {@link provideHttpClient}
 */
export declare function withNoXsrfProtection(): HttpFeature<HttpFeatureKind.NoXsrfProtection>;
/**
 * Add JSONP support to the configuration of the current `HttpClient` instance.
 *
 * @see {@link provideHttpClient}
 */
export declare function withJsonpSupport(): HttpFeature<HttpFeatureKind.JsonpSupport>;
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
export declare function withRequestsMadeViaParent(): HttpFeature<HttpFeatureKind.RequestsMadeViaParent>;
/**
 * Configures the current `HttpClient` instance to make requests using the fetch API.
 *
 * Note: The Fetch API doesn't support progress report on uploads.
 *
 * @publicApi
 */
export declare function withFetch(): HttpFeature<HttpFeatureKind.Fetch>;
