/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpTransferCacheOptions, ɵwithHttpTransferCache} from '@angular/common/http';
import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders, NgZone, Provider, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵwithDomHydration as withDomHydration} from '@angular/core';

import {RuntimeErrorCode} from './errors';


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
 *
 * The function accepts a configuration object as the first argument. The configuration object
 * may contain the following fields:
 *  - `domReuse` - a boolean value (`true` by default) that controls whether Angular should match
 * DOM nodes during hydration.
 *  - `httpTransferCache` - either a boolean to enable/disable transferring cache for eligible
 * requests performed using `HttpClient`, or an object, which allows to configure cache parameters,
 * such as which headers should be included (no headers are included by default).
 *
 * Setting the `domReuse` to `false` is discouraged, because it disables DOM nodes reuse during
 * hydration. Effectively makes
 *
 * @returns A set of providers to enable hydration.
 *
 * @publicApi
 * @developerPreview
 */
export function provideClientHydration(options?: {
  domReuse?: boolean,
  httpTransferCache?: boolean|HttpTransferCacheOptions,
}): EnvironmentProviders {
  return makeEnvironmentProviders([
    (typeof ngDevMode !== 'undefined' && ngDevMode) ? provideZoneJsCompatibilityDetector() : [],
    options?.domReuse === false ? [] : withDomHydration(),
    (options?.httpTransferCache === false ?
         [] :
         ɵwithHttpTransferCache(
             typeof options?.httpTransferCache === 'object' ? options.httpTransferCache : {})),
  ]);
}
