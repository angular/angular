/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵwithHttpTransferCache as withHttpTransferCache} from '@angular/common/http';
import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders, NgZone, Provider, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵwithDomHydration as withDomHydration} from '@angular/core';

import {RuntimeErrorCode} from './errors';

/**
 * The list of features as an enum to uniquely type each `HydrationFeature`.
 * @see HydrationFeature
 *
 * @publicApi
 * @developerPreview
 */
export const enum HydrationFeatureKind {
  NoDomReuseFeature,
  NoHttpTransferCache
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
    kind: FeatureKind, providers: Provider[] = []): HydrationFeature<FeatureKind> {
  return {ɵkind: kind, ɵproviders: providers};
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
 * @see `provideRouter`
 * @see `withEnabledBlockingInitialNavigation`
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
 * By default, the function enables the recommended set of features for the optimal
 * performance for most of the applications. You can enable/disable features by
 * passing special functions (from the `HydrationFeatures` set) as arguments to the
 * `provideClientHydration` function.
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
 * @see `withNoDomReuse`
 * @see `withNoHttpTransferCache`
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

  for (const {ɵproviders, ɵkind} of features) {
    featuresKind.add(ɵkind);

    if (ɵproviders.length) {
      providers.push(ɵproviders);
    }
  }

  return makeEnvironmentProviders([
    (typeof ngDevMode !== 'undefined' && ngDevMode) ? provideZoneJsCompatibilityDetector() : [],
    (featuresKind.has(HydrationFeatureKind.NoDomReuseFeature) ? [] : withDomHydration()),
    (featuresKind.has(HydrationFeatureKind.NoHttpTransferCache) ? [] : withHttpTransferCache()),
    providers,
  ]);
}
