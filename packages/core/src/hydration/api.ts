/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {first} from 'rxjs/operators';

import {APP_BOOTSTRAP_LISTENER, ApplicationRef} from '../application_ref';
import {ENABLED_SSR_FEATURES, PLATFORM_ID} from '../application_tokens';
import {Console} from '../console';
import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, Injector, makeEnvironmentProviders} from '../di';
import {inject} from '../di/injector_compatibility';
import {formatRuntimeError, RuntimeErrorCode} from '../errors';
import {InitialRenderPendingTasks} from '../initial_render_pending_tasks';
import {enableLocateOrCreateContainerRefImpl} from '../linker/view_container_ref';
import {enableLocateOrCreateElementNodeImpl} from '../render3/instructions/element';
import {enableLocateOrCreateElementContainerNodeImpl} from '../render3/instructions/element_container';
import {enableApplyRootElementTransformImpl} from '../render3/instructions/shared';
import {enableLocateOrCreateContainerAnchorImpl} from '../render3/instructions/template';
import {enableLocateOrCreateTextNodeImpl} from '../render3/instructions/text';
import {TransferState} from '../transfer_state';

import {cleanupDehydratedViews} from './cleanup';
import {IS_HYDRATION_DOM_REUSE_ENABLED, PRESERVE_HOST_CONTENT} from './tokens';
import {enableRetrieveHydrationInfoImpl, NGH_DATA_KEY} from './utils';
import {enableFindMatchingDehydratedViewImpl} from './views';


/**
 * Indicates whether the hydration-related code was added,
 * prevents adding it multiple times.
 */
let isHydrationSupportEnabled = false;

/**
 * Brings the necessary hydration code in tree-shakable manner.
 * The code is only present when the `provideClientHydration` is
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
 * Outputs a message with hydration stats into a console.
 */
function printHydrationStats(injector: Injector) {
  const console = injector.get(Console);
  const message = `Angular hydrated ${ngDevMode!.hydratedComponents} component(s) ` +
      `and ${ngDevMode!.hydratedNodes} node(s), ` +
      `${ngDevMode!.componentsSkippedHydration} component(s) were skipped. ` +
      `Note: this feature is in Developer Preview mode. ` +
      `Learn more at https://next.angular.io/guide/hydration.`;
  // tslint:disable-next-line:no-console
  console.log(message);
}


/**
 * Returns a Promise that is resolved when an application becomes stable.
 */
function whenStable(
    appRef: ApplicationRef, pendingTasks: InitialRenderPendingTasks): Promise<unknown> {
  const isStablePromise = appRef.isStable.pipe(first((isStable: boolean) => isStable)).toPromise();
  const pendingTasksPromise = pendingTasks.whenAllTasksComplete;
  return Promise.allSettled([isStablePromise, pendingTasksPromise]);
}

/**
 * Returns a set of providers required to setup hydration support
 * for an application that is server side rendered. This function is
 * included into the `provideClientHydration` public API function from
 * the `platform-browser` package.
 *
 * The function sets up an internal flag that would be recognized during
 * the server side rendering time as well, so there is no need to
 * configure or change anything in NgUniversal to enable the feature.
 */
export function withDomHydration(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: IS_HYDRATION_DOM_REUSE_ENABLED,
      useFactory: () => {
        let isEnabled = true;
        if (isBrowser()) {
          // On the client, verify that the server response contains
          // hydration annotations. Otherwise, keep hydration disabled.
          const transferState = inject(TransferState, {optional: true});
          isEnabled = !!transferState?.get(NGH_DATA_KEY, null);
          if (!isEnabled && (typeof ngDevMode !== 'undefined' && ngDevMode)) {
            const console = inject(Console);
            const message = formatRuntimeError(
                RuntimeErrorCode.MISSING_HYDRATION_ANNOTATIONS,
                'Angular hydration was requested on the client, but there was no ' +
                    'serialized information present in the server response, ' +
                    'thus hydration was not enabled. ' +
                    'Make sure the `provideClientHydration()` is included into the list ' +
                    'of providers in the server part of the application configuration.');
            // tslint:disable-next-line:no-console
            console.warn(message);
          }
        }
        if (isEnabled) {
          inject(ENABLED_SSR_FEATURES).add('hydration');
        }
        return isEnabled;
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        // Since this function is used across both server and client,
        // make sure that the runtime code is only added when invoked
        // on the client. Moving forward, the `isBrowser` check should
        // be replaced with a tree-shakable alternative (e.g. `isServer`
        // flag).
        if (isBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          enableHydrationRuntimeSupport();
        }
      },
      multi: true,
    },
    {
      provide: PRESERVE_HOST_CONTENT,
      useFactory: () => {
        // Preserve host element content only in a browser
        // environment and when hydration is configured properly.
        // On a server, an application is rendered from scratch,
        // so the host content needs to be empty.
        return isBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED);
      }
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        if (isBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          const appRef = inject(ApplicationRef);
          const pendingTasks = inject(InitialRenderPendingTasks);
          const injector = inject(Injector);
          return () => {
            whenStable(appRef, pendingTasks).then(() => {
              // Wait until an app becomes stable and cleanup all views that
              // were not claimed during the application bootstrap process.
              // The timing is similar to when we start the serialization process
              // on the server.
              cleanupDehydratedViews(appRef);

              if (typeof ngDevMode !== 'undefined' && ngDevMode) {
                printHydrationStats(injector);
              }
            });
          };
        }
        return () => {};  // noop
      },
      multi: true,
    }
  ]);
}
