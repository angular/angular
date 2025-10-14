/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HttpTransferCacheOptions } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
/**
 * The list of features as an enum to uniquely type each `HydrationFeature`.
 * @see {@link HydrationFeature}
 *
 * @publicApi
 */
export declare enum HydrationFeatureKind {
    NoHttpTransferCache = 0,
    HttpTransferCacheOptions = 1,
    I18nSupport = 2,
    EventReplay = 3,
    IncrementalHydration = 4
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
 * Disables HTTP transfer cache. Effectively causes HTTP requests to be performed twice: once on the
 * server and other one on the browser.
 *
 * @publicApi
 */
export declare function withNoHttpTransferCache(): HydrationFeature<HydrationFeatureKind.NoHttpTransferCache>;
/**
 * The function accepts an object, which allows to configure cache parameters,
 * such as which headers should be included (no headers are included by default),
 * whether POST requests should be cached or a callback function to determine if a
 * particular request should be cached.
 *
 * @publicApi
 */
export declare function withHttpTransferCacheOptions(options: HttpTransferCacheOptions): HydrationFeature<HydrationFeatureKind.HttpTransferCacheOptions>;
/**
 * Enables support for hydrating i18n blocks.
 *
 * @publicApi 20.0
 */
export declare function withI18nSupport(): HydrationFeature<HydrationFeatureKind.I18nSupport>;
/**
 * Enables support for replaying user events (e.g. `click`s) that happened on a page
 * before hydration logic has completed. Once an application is hydrated, all captured
 * events are replayed and relevant event listeners are executed.
 *
 * @usageNotes
 *
 * Basic example of how you can enable event replay in your application when
 * `bootstrapApplication` function is used:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration(withEventReplay())]
 * });
 * ```
 * @publicApi
 * @see {@link provideClientHydration}
 */
export declare function withEventReplay(): HydrationFeature<HydrationFeatureKind.EventReplay>;
/**
 * Enables support for incremental hydration using the `hydrate` trigger syntax.
 *
 * @usageNotes
 *
 * Basic example of how you can enable incremental hydration in your application when
 * the `bootstrapApplication` function is used:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration(withIncrementalHydration())]
 * });
 * ```
 * @publicApi 20.0
 * @see {@link provideClientHydration}
 */
export declare function withIncrementalHydration(): HydrationFeature<HydrationFeatureKind.IncrementalHydration>;
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
 * These functions allow you to disable some of the default features or enable new ones:
 *
 * * {@link withNoHttpTransferCache} to disable HTTP transfer cache
 * * {@link withHttpTransferCacheOptions} to configure some HTTP transfer cache options
 * * {@link withI18nSupport} to enable hydration support for i18n blocks
 * * {@link withEventReplay} to enable support for replaying user events
 *
 * @usageNotes
 *
 * Basic example of how you can enable hydration in your application when
 * `bootstrapApplication` function is used:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideClientHydration()]
 * });
 * ```
 *
 * Alternatively if you are using NgModules, you would add `provideClientHydration`
 * to your root app module's provider list.
 * ```ts
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
 * @see {@link withI18nSupport}
 * @see {@link withEventReplay}
 *
 * @param features Optional features to configure additional hydration behaviors.
 * @returns A set of providers to enable hydration.
 *
 * @publicApi 17.0
 */
export declare function provideClientHydration(...features: HydrationFeature<HydrationFeatureKind>[]): EnvironmentProviders;
