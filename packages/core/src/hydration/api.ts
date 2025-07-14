/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_BOOTSTRAP_LISTENER, ApplicationRef} from '../application/application_ref';
import {Console} from '../console';
import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  Injector,
  makeEnvironmentProviders,
  Provider,
} from '../di';
import {inject} from '../di/injector_compatibility';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from '../errors';
import {enableLocateOrCreateContainerRefImpl} from '../linker/view_container_ref';
import {enableLocateOrCreateI18nNodeImpl} from '../render3/i18n/i18n_apply';
import {enableLocateOrCreateElementNodeImpl} from '../render3/instructions/element';
import {enableLocateOrCreateElementContainerNodeImpl} from '../render3/instructions/element_container';
import {enableApplyRootElementTransformImpl} from '../render3/instructions/shared';
import {enableLocateOrCreateContainerAnchorImpl} from '../render3/instructions/template';
import {enableLocateOrCreateTextNodeImpl} from '../render3/instructions/text';
import {getDocument} from '../render3/interfaces/document';
import {TransferState} from '../transfer_state';
import {performanceMarkFeature} from '../util/performance';
import {NgZone} from '../zone';
import {withEventReplay} from './event_replay';

import {cleanupDehydratedViews} from './cleanup';
import {
  enableClaimDehydratedIcuCaseImpl,
  enablePrepareI18nBlockForHydrationImpl,
  setIsI18nHydrationSupportEnabled,
} from './i18n';
import {
  IS_HYDRATION_DOM_REUSE_ENABLED,
  IS_I18N_HYDRATION_ENABLED,
  IS_INCREMENTAL_HYDRATION_ENABLED,
  PRESERVE_HOST_CONTENT,
} from './tokens';
import {
  appendDeferBlocksToJSActionMap,
  countBlocksSkippedByHydration,
  enableRetrieveDeferBlockDataImpl,
  enableRetrieveHydrationInfoImpl,
  isIncrementalHydrationEnabled,
  NGH_DATA_KEY,
  processBlockData,
  verifySsrContentsIntegrity,
} from './utils';
import {enableFindMatchingDehydratedViewImpl} from './views';
import {DEHYDRATED_BLOCK_REGISTRY, DehydratedBlockRegistry} from '../defer/registry';
import {gatherDeferBlocksCommentNodes} from './node_lookup_utils';
import {processAndInitTriggers} from '../defer/triggering';

/**
 * Indicates whether the hydration-related code was added,
 * prevents adding it multiple times.
 */
let isHydrationSupportEnabled = false;

/**
 * Indicates whether the i18n-related code was added,
 * prevents adding it multiple times.
 *
 * Note: This merely controls whether the code is loaded,
 * while `setIsI18nHydrationSupportEnabled` determines
 * whether i18n blocks are serialized or hydrated.
 */
let isI18nHydrationRuntimeSupportEnabled = false;

/**
 * Indicates whether the incremental hydration code was added,
 * prevents adding it multiple times.
 */
let isIncrementalHydrationRuntimeSupportEnabled = false;

/**
 * Defines a period of time that Angular waits for the `ApplicationRef.isStable` to emit `true`.
 * If there was no event with the `true` value during this time, Angular reports a warning.
 */
const APPLICATION_IS_STABLE_TIMEOUT = 10_000;

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
 * Brings the necessary i18n hydration code in tree-shakable manner.
 * Similar to `enableHydrationRuntimeSupport`, the code is only
 * present when `withI18nSupport` is invoked.
 */
function enableI18nHydrationRuntimeSupport() {
  if (!isI18nHydrationRuntimeSupportEnabled) {
    isI18nHydrationRuntimeSupportEnabled = true;
    enableLocateOrCreateI18nNodeImpl();
    enablePrepareI18nBlockForHydrationImpl();
    enableClaimDehydratedIcuCaseImpl();
  }
}

/**
 * Brings the necessary incremental hydration code in tree-shakable manner.
 * Similar to `enableHydrationRuntimeSupport`, the code is only
 * present when `enableIncrementalHydrationRuntimeSupport` is invoked.
 */
function enableIncrementalHydrationRuntimeSupport() {
  if (!isIncrementalHydrationRuntimeSupportEnabled) {
    isIncrementalHydrationRuntimeSupportEnabled = true;
    enableRetrieveDeferBlockDataImpl();
  }
}

/**
 * Outputs a message with hydration stats into a console.
 */
function printHydrationStats(injector: Injector) {
  const console = injector.get(Console);
  const message =
    `Angular hydrated ${ngDevMode!.hydratedComponents} component(s) ` +
    `and ${ngDevMode!.hydratedNodes} node(s), ` +
    `${ngDevMode!.componentsSkippedHydration} component(s) were skipped. ` +
    (isIncrementalHydrationEnabled(injector)
      ? `${ngDevMode!.deferBlocksWithIncrementalHydration} defer block(s) were configured to use incremental hydration. `
      : '') +
    `Learn more at https://angular.dev/guide/hydration.`;
  // tslint:disable-next-line:no-console
  console.log(message);
}

/**
 * Returns a Promise that is resolved when an application becomes stable.
 */
function whenStableWithTimeout(appRef: ApplicationRef): Promise<void> {
  // Wrapping in a promise to delay the execution of `whenStable` function
  // to the next microtask. This is needed to ensure that all framework
  // features are registered and prevents race conditions in zoneless apps.
  return Promise.resolve().then(() => {
    const whenStablePromise = appRef.whenStable();
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const timeoutTime = APPLICATION_IS_STABLE_TIMEOUT;
      const console = appRef.injector.get(Console);
      const ngZone = appRef.injector.get(NgZone);

      // The following call should not and does not prevent the app to become stable
      // We cannot use RxJS timer here because the app would remain unstable.
      // This also avoids an extra change detection cycle.
      const timeoutId = ngZone.runOutsideAngular(() => {
        return setTimeout(() => logWarningOnStableTimedout(timeoutTime, console), timeoutTime);
      });

      whenStablePromise.finally(() => clearTimeout(timeoutId));
    }

    return whenStablePromise;
  });
}

/**
 * Defines a name of an attribute that is added to the <body> tag
 * in the `index.html` file in case a given route was configured
 * with `RenderMode.Client`. 'cm' is an abbreviation for "Client Mode".
 */
export const CLIENT_RENDER_MODE_FLAG = 'ngcm';

/**
 * Checks whether the `RenderMode.Client` was defined for the current route.
 */
function isClientRenderModeEnabled(): boolean {
  const doc = getDocument();
  return (
    (typeof ngServerMode === 'undefined' || !ngServerMode) &&
    doc.body.hasAttribute(CLIENT_RENDER_MODE_FLAG)
  );
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
  const providers: Provider[] = [
    {
      provide: IS_HYDRATION_DOM_REUSE_ENABLED,
      useFactory: () => {
        let isEnabled = true;
        if (typeof ngServerMode === 'undefined' || !ngServerMode) {
          // On the client, verify that the server response contains
          // hydration annotations. Otherwise, keep hydration disabled.
          const transferState = inject(TransferState, {optional: true});
          isEnabled = !!transferState?.get(NGH_DATA_KEY, null);
        }
        if (isEnabled) {
          performanceMarkFeature('NgHydration');
        }
        return isEnabled;
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        // i18n support is enabled by calling withI18nSupport(), but there's
        // no way to turn it off (e.g. for tests), so we turn it off by default.
        setIsI18nHydrationSupportEnabled(false);

        if (typeof ngServerMode !== 'undefined' && ngServerMode) {
          // Since this function is used across both server and client,
          // make sure that the runtime code is only added when invoked
          // on the client (see the `enableHydrationRuntimeSupport` function
          // call below).
          return;
        }

        if (inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          verifySsrContentsIntegrity(getDocument());
          enableHydrationRuntimeSupport();
        } else if (typeof ngDevMode !== 'undefined' && ngDevMode && !isClientRenderModeEnabled()) {
          const console = inject(Console);
          const message = formatRuntimeError(
            RuntimeErrorCode.MISSING_HYDRATION_ANNOTATIONS,
            'Angular hydration was requested on the client, but there was no ' +
              'serialized information present in the server response, ' +
              'thus hydration was not enabled. ' +
              'Make sure the `provideClientHydration()` is included into the list ' +
              'of providers in the server part of the application configuration.',
          );
          console.warn(message);
        }
      },
      multi: true,
    },
  ];

  if (typeof ngServerMode === 'undefined' || !ngServerMode) {
    providers.push(
      {
        provide: PRESERVE_HOST_CONTENT,
        useFactory: () => {
          // Preserve host element content only in a browser
          // environment and when hydration is configured properly.
          // On a server, an application is rendered from scratch,
          // so the host content needs to be empty.
          return inject(IS_HYDRATION_DOM_REUSE_ENABLED);
        },
      },
      {
        provide: APP_BOOTSTRAP_LISTENER,
        useFactory: () => {
          if (inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
            const appRef = inject(ApplicationRef);

            return () => {
              // Wait until an app becomes stable and cleanup all views that
              // were not claimed during the application bootstrap process.
              // The timing is similar to when we start the serialization process
              // on the server.
              //
              // Note: the cleanup task *MUST* be scheduled within the Angular zone in Zone apps
              // to ensure that change detection is properly run afterward.
              whenStableWithTimeout(appRef).then(() => {
                // Note: we have to check whether the application is destroyed before
                // performing other operations with the `injector`.
                // The application may be destroyed **before** it becomes stable, so when
                // the `whenStableWithTimeout` resolves, the injector might already be in
                // a destroyed state. Thus, calling `injector.get` would throw an error
                // indicating that the injector has already been destroyed.
                if (appRef.destroyed) {
                  return;
                }

                cleanupDehydratedViews(appRef);
                if (typeof ngDevMode !== 'undefined' && ngDevMode) {
                  countBlocksSkippedByHydration(appRef.injector);
                  printHydrationStats(appRef.injector);
                }
              });
            };
          }
          return () => {}; // noop
        },
        multi: true,
      },
    );
  }

  return makeEnvironmentProviders(providers);
}

/**
 * Returns a set of providers required to setup support for i18n hydration.
 * Requires hydration to be enabled separately.
 */
export function withI18nSupport(): Provider[] {
  return [
    {
      provide: IS_I18N_HYDRATION_ENABLED,
      useFactory: () => inject(IS_HYDRATION_DOM_REUSE_ENABLED),
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        if (inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          enableI18nHydrationRuntimeSupport();
          setIsI18nHydrationSupportEnabled(true);
          performanceMarkFeature('NgI18nHydration');
        }
      },
      multi: true,
    },
  ];
}

/**
 * Returns a set of providers required to setup support for incremental hydration.
 * Requires hydration to be enabled separately.
 * Enabling incremental hydration also enables event replay for the entire app.
 */
export function withIncrementalHydration(): Provider[] {
  const providers: Provider[] = [
    withEventReplay(),
    {
      provide: IS_INCREMENTAL_HYDRATION_ENABLED,
      useValue: true,
    },
    {
      provide: DEHYDRATED_BLOCK_REGISTRY,
      useClass: DehydratedBlockRegistry,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        enableIncrementalHydrationRuntimeSupport();
        performanceMarkFeature('NgIncrementalHydration');
      },
      multi: true,
    },
  ];

  if (typeof ngServerMode === 'undefined' || !ngServerMode) {
    providers.push({
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        const injector = inject(Injector);
        const doc = getDocument();

        return () => {
          const deferBlockData = processBlockData(injector);
          const commentsByBlockId = gatherDeferBlocksCommentNodes(doc, doc.body);
          processAndInitTriggers(injector, deferBlockData, commentsByBlockId);
          appendDeferBlocksToJSActionMap(doc, injector);
        };
      },
      multi: true,
    });
  }

  return providers;
}

/**
 *
 * @param time The time in ms until the stable timedout warning message is logged
 */
function logWarningOnStableTimedout(time: number, console: Console): void {
  const message =
    `Angular hydration expected the ApplicationRef.isStable() to emit \`true\`, but it ` +
    `didn't happen within ${time}ms. Angular hydration logic depends on the application becoming stable ` +
    `as a signal to complete hydration process.`;

  console.warn(formatRuntimeError(RuntimeErrorCode.HYDRATION_STABLE_TIMEDOUT, message));
}
