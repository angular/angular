/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpTransferCacheOptions, ɵwithHttpTransferCache} from '@angular/common/http';
import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  NgZone,
  Provider,
  ɵConsole as Console,
  ɵformatRuntimeError as formatRuntimeError,
  ɵwithDomHydration as withDomHydration,
  ɵwithEventReplay,
  ɵwithI18nSupport,
  ɵwithPartialHydration,
} from '@angular/core';

import {RuntimeErrorCode} from './errors';

/**
 * The list of features as an enum to uniquely type each `HydrationFeature`.
 * @see {@link HydrationFeature}
 *
 * @publicApi
 */
export enum HydrationFeatureKind {
  NoHttpTransferCache,
  HttpTransferCacheOptions,
  I18nSupport,
  EventReplay,
  PartialHydration,
}

/**
 * Helper type to represent a Hydration feature.
 *
 * @publicApi
 */
export interface HydrationFeature<FeatureKind extends HydrationFeatureKind> {
  ɵkind: FeatureKind;
  ɵproviders: Provider[];
}

/**
 * Helper function to create an object that represents a Hydration feature.
 */
function hydrationFeature<FeatureKind extends HydrationFeatureKind>(
  ɵkind: FeatureKind,
  ɵproviders: Provider[] = [],
  ɵoptions: unknown = {},
): HydrationFeature<FeatureKind> {
  return {ɵkind, ɵproviders};
}

/**
 * Disables HTTP transfer cache. Effectively causes HTTP requests to be performed twice: once on the
 * server and other one on the browser.
 *
 * @publicApi
 */
export function withNoHttpTransferCache(): HydrationFeature<HydrationFeatureKind.NoHttpTransferCache> {
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
 */
export function withHttpTransferCacheOptions(
  options: HttpTransferCacheOptions,
): HydrationFeature<HydrationFeatureKind.HttpTransferCacheOptions> {
  // This feature has no providers and acts as a flag to pass options to the HTTP transfer cache.
  return hydrationFeature(
    HydrationFeatureKind.HttpTransferCacheOptions,
    ɵwithHttpTransferCache(options),
  );
}

/**
 * Enables support for hydrating i18n blocks.
 *
 * @developerPreview
 * @publicApi
 */
export function withI18nSupport(): HydrationFeature<HydrationFeatureKind.I18nSupport> {
  return hydrationFeature(HydrationFeatureKind.I18nSupport, ɵwithI18nSupport());
}

/**
 * Enables support for replaying user events (e.g. `click`s) that happened on a page
 * before hydration logic has completed. Once an application is hydrated, all captured
 * events are replayed and relevant event listeners are executed.
 *
 * @usageNotes
 *
 * Basic example of how you can enable event replay in your application when
 * `bootstrapApplication` function is used:
 * ```
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration(withEventReplay())]
 * });
 * ```
 * @developerPreview
 * @publicApi
 * @see {@link provideClientHydration}
 */
export function withEventReplay(): HydrationFeature<HydrationFeatureKind.EventReplay> {
  return hydrationFeature(HydrationFeatureKind.EventReplay, ɵwithEventReplay());
}

/**
 * Enables support for partial hydration using the `hydrate` trigger syntax.
 *
 * @usageNotes
 *
 * Basic example of how you can enable event replay in your application when
 * `bootstrapApplication` function is used:
 * ```
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration(withPartialHydration())]
 * });
 * ```
 * @experimental
 * @publicApi
 * @see {@link provideClientHydration}
 */
export function withPartialHydration(): HydrationFeature<HydrationFeatureKind.PartialHydration> {
  return hydrationFeature(HydrationFeatureKind.PartialHydration, ɵwithPartialHydration());
}

/**
 * Returns an `ENVIRONMENT_INITIALIZER` token setup with a function
 * that verifies whether compatible ZoneJS was used in an application
 * and logs a warning in a console if it's not the case.
 */
function provideZoneJsCompatibilityDetector(): Provider[] {
  return [
    {
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
              'This is not yet a fully supported configuration.',
          );
          // tslint:disable-next-line:no-console
          console.warn(message);
        }
      },
      multi: true,
    },
  ];
}

/**
 * Sets up providers necessary to enable hydration functionality for the application.
 *
 * By default, the function enables the recommended set of features for the optimal
 * performance for most of the applications. It includes the following features:
 *
 * * Reconciling DOM hydration. Learn more about it [here](guide/hydration).
 * * [`HttpClient`](api/common/http/HttpClient) response caching while running on the server and
 * transferring this cache to the client to avoid extra HTTP requests. Learn more about data caching
 * [here](guide/ssr#caching-data-when-using-httpclient).
 *
 * These functions allow you to disable some of the default features or configure features
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
 * @see {@link withNoHttpTransferCache}
 * @see {@link withHttpTransferCacheOptions}
 *
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to enable hydration.
 *
 * @publicApi
 */
export function provideClientHydration(
  ...features: HydrationFeature<HydrationFeatureKind>[]
): EnvironmentProviders {
  const providers: Provider[] = [];
  const featuresKind = new Set<HydrationFeatureKind>();
  const hasHttpTransferCacheOptions = featuresKind.has(
    HydrationFeatureKind.HttpTransferCacheOptions,
  );

  for (const {ɵproviders, ɵkind} of features) {
    featuresKind.add(ɵkind);

    if (ɵproviders.length) {
      providers.push(ɵproviders);
    }
  }

  if (
    typeof ngDevMode !== 'undefined' &&
    ngDevMode &&
    featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) &&
    hasHttpTransferCacheOptions
  ) {
    // TODO: Make this a runtime error
    throw new Error(
      'Configuration error: found both withHttpTransferCacheOptions() and withNoHttpTransferCache() in the same call to provideClientHydration(), which is a contradiction.',
    );
  }

  return makeEnvironmentProviders([
    typeof ngDevMode !== 'undefined' && ngDevMode ? provideZoneJsCompatibilityDetector() : [],
    withDomHydration(),
    featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) || hasHttpTransferCacheOptions
      ? []
      : ɵwithHttpTransferCache({}),
    providers,
  ]);
}
