/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpTransferCacheOptions, ɵwithHttpTransferCache} from '@angular/common/http';
import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders, NgZone, Provider, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵwithDomHydration as withDomHydration,} from '@angular/core';

import {RuntimeErrorCode} from './errors';

/**
 * The list of features as an enum to uniquely type each `HydrationFeature`.
 * @see {@link HydrationFeature}
 *
 * @publicApi
 * @developerPreview
 */
export const enum HydrationFeatureKind {
  NoDomReuseFeature,
  NoHttpTransferCache,
  HttpTransferCacheOptions,
}

/**
 * Helper type to represent a Hydration feature.
 *
 * @publicApi
 * @developerPreview
 */
export interface HydrationFeature<FeatureKind extends HydrationFeatureKind> {
  ɵkind: FeatureKind;
  ɵproviders: Provider[];
}

/**
 * Helper function to create an object that represents a Hydration feature.
 */
function hydrationFeature<FeatureKind extends HydrationFeatureKind>(
    ɵkind: FeatureKind, ɵproviders: Provider[] = [],
    ɵoptions: unknown = {}): HydrationFeature<FeatureKind> {
  return {ɵkind, ɵproviders};
}

/**
 * Disables DOM nodes reuse during hydration. Effectively makes
 * Angular re-render an application from scratch on the client.
 *
 * When this option is enabled, make sure that the initial navigation
 * option is configured for the Router as `enabledBlocking` by using the
 * `withEnabledBlockingInitialNavigation` in the `provideRouter` call:
 *
 * ```
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideRouter(
 *       // ... other features ...
 *       withEnabledBlockingInitialNavigation()
 *     ),
 *     provideClientHydration(withNoDomReuse())
 *   ]
 * });
 * ```
 *
 * This would ensure that the application is rerendered after all async
 * operations in the Router (such as lazy-loading of components,
 * waiting for async guards and resolvers) are completed to avoid
 * clearing the DOM on the client too soon, thus causing content flicker.
 *
 * The use of this function is discouraged, because it disables DOM nodes reuse during
 * hydration.
 *
 * @see {@link provideRouter}
 * @see {@link withEnabledBlockingInitialNavigation}
 *
 * @publicApi
 * @developerPreview
 */
export function withNoDomReuse(): HydrationFeature<HydrationFeatureKind.NoDomReuseFeature> {
  // This feature has no providers and acts as a flag that turns off
  // non-destructive hydration (which otherwise is turned on by default).
  return hydrationFeature(HydrationFeatureKind.NoDomReuseFeature);
}

/**
 * Disables HTTP transfer cache. Effectively causes HTTP requests to be performed twice: once on the
 * server and other one on the browser.
 *
 * @publicApi
 * @developerPreview
 */
export function withNoHttpTransferCache():
    HydrationFeature<HydrationFeatureKind.NoHttpTransferCache> {
  // This feature has no providers and acts as a flag that turns off
  // HTTP transfer cache (which otherwise is turned on by default).
  return hydrationFeature(HydrationFeatureKind.NoHttpTransferCache);
}

/**
 * The function accepts a an object, which allows to configure cache parameters,
 * such as which headers should be included (no headers are included by default),
 * wether POST requests should be cached or a callback function to determine if a
 * particular request should be cached.
 *
 * @publicApi
 * @developerPreview
 */
export function withHttpTransferCacheOptions(
    options: HttpTransferCacheOptions,
    ): HydrationFeature<HydrationFeatureKind.HttpTransferCacheOptions> {
  // This feature has no providers and acts as a flag to pass options to the HTTP transfer cache.
  return hydrationFeature(
      HydrationFeatureKind.HttpTransferCacheOptions, ɵwithHttpTransferCache(options));
}

/**
 * Returns an `ENVIRONMENT_INITIALIZER` token setup with a function
 * that verifies whether compatible ZoneJS was used in an application
 * and logs a warning in a console if it's not the case.
 */
function provideZoneJsCompatibilityDetector(): Provider[] {
  return [{
    provide: ENVIRONMENT_INITIALIZER,
    useValue: () => {
      const ngZone = inject(NgZone);
      // Checking `ngZone instanceof NgZone` would be insufficient here,
      // because custom implementations might use NgZone as a base class.
      if (ngZone.constructor !== NgZone) {
        const console = inject(Console);
        const message = formatRuntimeError(
            RuntimeErrorCode.UNSUPPORTED_ZONEJS_INSTANCE,
            'Angular detected that hydration was enabled for an application ' +
                'that uses a custom or a noop Zone.js implementation. ' +
                'This is not yet a fully supported configuration.');
        // tslint:disable-next-line:no-console
        console.warn(message);
      }
    },
    multi: true,
  }];
}

/**
 * Sets up providers necessary to enable hydration functionality for the application.
 *
 * By default, the function enables the recommended set of features for the optimal
 * performance for most of the applications. You can enable/disable features by
 * passing special functions (from the `HydrationFeatures` set) as arguments to the
 * `provideClientHydration` function. It includes the following features:
 *
 * * Reconciling DOM hydration. Learn more about it [here](guide/hydration).
 * * [`HttpClient`](api/common/http/HttpClient) response caching while running on the server and
 * transferring this cache to the client to avoid extra HTTP requests. Learn more about data caching
 * [here](/guide/universal#caching-data-when-using-httpclient).
 *
 * These functions allow you to disable some of the default features or configure features
 * * {@link withNoDomReuse} to disable DOM nodes reuse during hydration
 * * {@link withNoHttpTransferCache} to disable HTTP transfer cache
 * * {@link withHttpTransferCacheOptions} to configure some HTTP transfer cache options
 *
 * @usageNotes
 *
 * Basic example of how you can enable hydration in your application when
 * `bootstrapApplication` function is used:
 * ```
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration()]
 * });
 * ```
 *
 * Alternatively if you are using NgModules, you would add `provideClientHydration`
 * to your root app module's provider list.
 * ```
 * @NgModule({
 *   declarations: [RootCmp],
 *   bootstrap: [RootCmp],
 *   providers: [provideClientHydration()],
 * })
 * export class AppModule {}
 * ```
 *
 * @see {@link withNoDomReuse}
 * @see {@link withNoHttpTransferCache}
 * @see {@link withHttpTransferCacheOptions}
 *
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to enable hydration.
 *
 * @publicApi
 * @developerPreview
 */
export function provideClientHydration(...features: HydrationFeature<HydrationFeatureKind>[]):
    EnvironmentProviders {
  const providers: Provider[] = [];
  const featuresKind = new Set<HydrationFeatureKind>();
  const hasHttpTransferCacheOptions =
      featuresKind.has(HydrationFeatureKind.HttpTransferCacheOptions);

  for (const {ɵproviders, ɵkind} of features) {
    featuresKind.add(ɵkind);

    if (ɵproviders.length) {
      providers.push(ɵproviders);
    }
  }

  if (typeof ngDevMode !== 'undefined' && ngDevMode &&
      featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) && hasHttpTransferCacheOptions) {
    // TODO: Make this a runtime error
    throw new Error(
        'Configuration error: found both withHttpTransferCacheOptions() and withNoHttpTransferCache() in the same call to provideClientHydration(), which is a contradiction.');
  }

  return makeEnvironmentProviders([
    (typeof ngDevMode !== 'undefined' && ngDevMode) ? provideZoneJsCompatibilityDetector() : [],
    (featuresKind.has(HydrationFeatureKind.NoDomReuseFeature) ? [] : withDomHydration()),
    ((featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) || hasHttpTransferCacheOptions) ?
         [] :
         ɵwithHttpTransferCache({})),
    providers,
  ]);
}
