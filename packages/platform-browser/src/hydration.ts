/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentProviders, makeEnvironmentProviders, Provider, ɵwithDomHydration as withDomHydration} from '@angular/core';

/**
 * The list of features as an enum to uniquely type each feature.
 */
export const enum HydrationFeatureKind {
  NoDomReuseFeature
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
    kind: FeatureKind, providers: Provider[]): HydrationFeature<FeatureKind> {
  return {ɵkind: kind, ɵproviders: providers};
}

/**
 * A type alias that represents a feature which disables DOM reuse during hydration
 * (effectively making Angular re-render the whole application from scratch).
 * The type is used to describe the return value of the `withoutDomReuse` function.
 *
 * @see `withoutDomReuse`
 * @see `provideClientHydration`
 *
 * @publicApi
 * @developerPreview
 */
export type NoDomReuseFeature = HydrationFeature<HydrationFeatureKind.NoDomReuseFeature>;

/**
 * Disables DOM nodes reuse during hydration. Effectively makes
 * Angular re-render an application from scratch on the client.
 *
 * @publicApi
 * @developerPreview
 */
export function withoutDomReuse(): NoDomReuseFeature {
  // This feature has no providers and acts as a flag that turns off
  // non-destructive hydration (which otherwise is turned on by default).
  const providers: Provider[] = [];
  return hydrationFeature(HydrationFeatureKind.NoDomReuseFeature, providers);
}

/**
 * A type alias that represents all Hydration features available for use with
 * `provideClientHydration`. Features can be enabled by adding special functions to the
 * `provideClientHydration` call. See documentation for each symbol to find corresponding
 * function name. See also `provideClientHydration` documentation on how to use those functions.
 *
 * @see `provideClientHydration`
 *
 * @publicApi
 * @developerPreview
 */
export type HydrationFeatures = NoDomReuseFeature;

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
 * @see `HydrationFeatures`
 *
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to enable hydration.
 *
 * @publicApi
 * @developerPreview
 */
export function provideClientHydration(...features: HydrationFeatures[]): EnvironmentProviders {
  const shouldUseDomHydration =
      !features.find(feature => feature.ɵkind === HydrationFeatureKind.NoDomReuseFeature);
  return makeEnvironmentProviders([
    (shouldUseDomHydration ? withDomHydration() : []),
    features.map(feature => feature.ɵproviders),
  ]);
}
