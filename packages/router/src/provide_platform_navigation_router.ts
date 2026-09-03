/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location, ɵNavigationAdapterForLocation} from '@angular/common';
import {EnvironmentProviders, inject, provideEnvironmentInitializer} from '@angular/core';

import {Routes} from './models';
import {provideRouterInternal, RouterFeatures} from './provide_router';
import {NavigationStateManager} from './statemanager/navigation_state_manager';
import {StateManager} from './statemanager/state_manager';

/**
 * Sets up providers necessary to enable `Router` functionality for the application using the
 * browser's Navigation API.
 *
 * @usageNotes
 *
 * Basic example of how you can add a Platform Navigation Router to your application:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent, {
 *   providers: [providePlatformNavigationRouter(appRoutes)]
 * });
 * ```
 *
 * @see [Navigation API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
 * @see {@link provideRouter}
 *
 * @experimental
 * @param routes A set of `Route`s to use for the application routing table.
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to setup a Router using the platform Navigation API.
 */
export function providePlatformNavigationRouter(
  routes: Routes,
  ...features: RouterFeatures[]
): EnvironmentProviders {
  const devModeLocationCheck =
    typeof ngDevMode === 'undefined' || ngDevMode
      ? [
          provideEnvironmentInitializer(() => {
            const locationInstance = inject(Location);
            if (!(locationInstance instanceof ɵNavigationAdapterForLocation)) {
              const locationConstructorName = (locationInstance as any).constructor.name;
              let message =
                `'providePlatformNavigationRouter' provides a 'Location' implementation that ensures navigation APIs are consistently used.` +
                ` An instance of ${locationConstructorName} was found instead.`;
              if (locationConstructorName === 'SpyLocation') {
                message += ` One of 'RouterTestingModule' or 'provideLocationMocks' was likely used. 'providePlatformNavigationRouter' does not work with these because they override the Location implementation.`;
              }
              throw new Error(message);
            }
          }),
        ]
      : [];

  return provideRouterInternal(
    [
      {provide: StateManager, useExisting: NavigationStateManager},
      {provide: Location, useClass: ɵNavigationAdapterForLocation},
      devModeLocationCheck,
    ],
    routes,
    features,
  );
}
