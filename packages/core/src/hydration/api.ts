/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PLATFORM_ID} from '../application_tokens';
import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders} from '../di';
import {inject} from '../di/injector_compatibility';
import {enableLocateOrCreateContainerRefImpl} from '../linker/view_container_ref';
import {enableLocateOrCreateElementNodeImpl} from '../render3/instructions/element';
import {enableLocateOrCreateElementContainerNodeImpl} from '../render3/instructions/element_container';
import {enableApplyRootElementTransformImpl} from '../render3/instructions/shared';
import {enableLocateOrCreateContainerAnchorImpl} from '../render3/instructions/template';
import {enableLocateOrCreateTextNodeImpl} from '../render3/instructions/text';

import {IS_HYDRATION_FEATURE_ENABLED, PRESERVE_HOST_CONTENT} from './tokens';
import {enableRetrieveHydrationInfoImpl} from './utils';
import {enableFindMatchingDehydratedViewImpl} from './views';


/**
 * Indicates whether the hydration-related code was added,
 * prevents adding it multiple times.
 */
let isHydrationSupportEnabled = false;

/**
 * Brings the necessary hydration code in tree-shakable manner.
 * The code is only present when the `provideHydrationSupport` is
 * invoked. Otherwise, this code is tree-shaken away during the
 * build optimization step.
 *
 * This technique allows us to swap implementations of methods so
 * tree shaking works appropriately when hydration is disabled or
 * enabled. It brings in the appropriate version of the method that
 * supports hydration only when enabled.
 */
function enableHydrationRuntimeSupport() {
  if (!isHydrationSupportEnabled) {
    isHydrationSupportEnabled = true;
    enableRetrieveHydrationInfoImpl();
    enableLocateOrCreateElementNodeImpl();
    enableLocateOrCreateTextNodeImpl();
    enableLocateOrCreateElementContainerNodeImpl();
    enableLocateOrCreateContainerAnchorImpl();
    enableLocateOrCreateContainerRefImpl();
    enableFindMatchingDehydratedViewImpl();
    enableApplyRootElementTransformImpl();
  }
}

/**
 * Detects whether the code is invoked in a browser.
 * Later on, this check should be replaced with a tree-shakable
 * flag (e.g. `!isServer`).
 */
function isBrowser(): boolean {
  return inject(PLATFORM_ID) === 'browser';
}

/**
 * Returns a set of providers required to setup hydration support
 * for an application that is server side rendered.
 *
 * ## NgModule-based bootstrap
 *
 * You can add the function call to the root AppModule of an application:
 * ```
 * import {provideHydrationSupport} from '@angular/core';
 *
 * @NgModule({
 *   providers: [
 *     // ... other providers ...
 *     provideHydrationSupport()
 *   ],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent]
 * })
 * class AppModule {}
 * ```
 *
 * ## Standalone-based bootstrap
 *
 * Add the function to the `bootstrapApplication` call:
 * ```
 * import {provideHydrationSupport} from '@angular/core';
 *
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     // ... other providers ...
 *     provideHydrationSupport()
 *   ]
 * });
 * ```
 *
 * The function sets up an internal flag that would be recognized during
 * the server side rendering time as well, so there is no need to
 * configure or change anything in NgUniversal to enable the feature.
 *
 * @publicApi
 * @developerPreview
 */
export function provideHydrationSupport(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        // Since this function is used across both server and client,
        // make sure that the runtime code is only added when invoked
        // on the client. Moving forward, the `isBrowser` check should
        // be replaced with a tree-shakable alternative (e.g. `isServer`
        // flag).
        if (isBrowser()) {
          enableHydrationRuntimeSupport();
        }
      },
      multi: true,
    },
    {
      provide: IS_HYDRATION_FEATURE_ENABLED,
      useValue: true,
    },
    {
      provide: PRESERVE_HOST_CONTENT,
      // Preserve host element content only in a browser
      // environment. On a server, an application is rendered
      // from scratch, so the host content needs to be empty.
      useFactory: () => isBrowser(),
    }
  ]);
}
