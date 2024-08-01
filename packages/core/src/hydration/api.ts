/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BOOTSTRAP_LISTENER, ApplicationRef, whenStable} from '../application/application_ref';
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
import {isPlatformBrowser} from '../render3/util/misc_utils';
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
  IS_PARTIAL_HYDRATION_ENABLED,
  PRESERVE_HOST_CONTENT,
} from './tokens';
import {enableRetrieveHydrationInfoImpl, NGH_DATA_KEY, SSR_CONTENT_INTEGRITY_MARKER} from './utils';
import {enableFindMatchingDehydratedViewImpl} from './views';
import {bootstrapPartialHydration, enableRetrieveDeferBlockDataImpl} from './partial';

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
 * Indicates whether the partial hydration code was added,
 * prevents adding it multiple times.
 */
let isPartialHydrationRuntimeSupportEnabled = false;

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
 * Brings the necessary partial hydration code in tree-shakable manner.
 * Similar to `enableHydrationRuntimeSupport`, the code is only
 * present when `enablePartialHydrationRuntimeSupport` is invoked.
 */
function enablePartialHydrationRuntimeSupport() {
  if (!isPartialHydrationRuntimeSupportEnabled) {
    isPartialHydrationRuntimeSupportEnabled = true;
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
    `Learn more at https://angular.dev/guide/hydration.`;
  // tslint:disable-next-line:no-console
  console.log(message);
}

/**
 * Returns a Promise that is resolved when an application becomes stable.
 */
function whenStableWithTimeout(appRef: ApplicationRef, injector: Injector): Promise<void> {
  const whenStablePromise = whenStable(appRef);
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const timeoutTime = APPLICATION_IS_STABLE_TIMEOUT;
    const console = injector.get(Console);
    const ngZone = injector.get(NgZone);

    // The following call should not and does not prevent the app to become stable
    // We cannot use RxJS timer here because the app would remain unstable.
    // This also avoids an extra change detection cycle.
    const timeoutId = ngZone.runOutsideAngular(() => {
      return setTimeout(() => logWarningOnStableTimedout(timeoutTime, console), timeoutTime);
    });

    whenStablePromise.finally(() => clearTimeout(timeoutId));
  }

  return whenStablePromise;
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
        if (isPlatformBrowser()) {
          // On the client, verify that the server response contains
          // hydration annotations. Otherwise, keep hydration disabled.
          const transferState = inject(TransferState, {optional: true});
          isEnabled = !!transferState?.get(NGH_DATA_KEY, null);
          if (!isEnabled && typeof ngDevMode !== 'undefined' && ngDevMode) {
            const console = inject(Console);
            const message = formatRuntimeError(
              RuntimeErrorCode.MISSING_HYDRATION_ANNOTATIONS,
              'Angular hydration was requested on the client, but there was no ' +
                'serialized information present in the server response, ' +
                'thus hydration was not enabled. ' +
                'Make sure the `provideClientHydration()` is included into the list ' +
                'of providers in the server part of the application configuration.',
            );
            // tslint:disable-next-line:no-console
            console.warn(message);
          }
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

        // Since this function is used across both server and client,
        // make sure that the runtime code is only added when invoked
        // on the client. Moving forward, the `isPlatformBrowser` check should
        // be replaced with a tree-shakable alternative (e.g. `isServer`
        // flag).
        if (isPlatformBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          verifySsrContentsIntegrity();
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
        return isPlatformBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED);
      },
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        if (isPlatformBrowser() && inject(IS_HYDRATION_DOM_REUSE_ENABLED)) {
          const appRef = inject(ApplicationRef);
          const injector = inject(Injector);
          return () => {
            // Wait until an app becomes stable and cleanup all views that
            // were not claimed during the application bootstrap process.
            // The timing is similar to when we start the serialization process
            // on the server.
            //
            // Note: the cleanup task *MUST* be scheduled within the Angular zone in Zone apps
            // to ensure that change detection is properly run afterward.
            whenStableWithTimeout(appRef, injector).then(() => {
              cleanupDehydratedViews(appRef);
              if (typeof ngDevMode !== 'undefined' && ngDevMode) {
                printHydrationStats(injector);
              }
            });
          };
        }
        return () => {}; // noop
      },
      multi: true,
    },
  ]);
}

/**
 * Returns a set of providers required to setup support for i18n hydration.
 * Requires hydration to be enabled separately.
 */
export function withI18nSupport(): Provider[] {
  return [
    {
      provide: IS_I18N_HYDRATION_ENABLED,
      useValue: true,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        enableI18nHydrationRuntimeSupport();
        setIsI18nHydrationSupportEnabled(true);
        performanceMarkFeature('NgI18nHydration');
      },
      multi: true,
    },
  ];
}

/**
 * Returns a set of providers required to setup support for i18n hydration.
 * Requires hydration to be enabled separately.
 */
export function withPartialHydration(): Provider[] {
  return [
    {
      provide: IS_PARTIAL_HYDRATION_ENABLED,
      useValue: true,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        enablePartialHydrationRuntimeSupport();
      },
      multi: true,
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        if (isPlatformBrowser()) {
          const injector = inject(Injector);
          return () => {
            bootstrapPartialHydration(getDocument(), injector);
          };
        }
        return () => {}; // noop for the server code
      },
      multi: true,
    },
    withEventReplay(),
  ];
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

/**
 * Verifies whether the DOM contains a special marker added during SSR time to make sure
 * there is no SSR'ed contents transformations happen after SSR is completed. Typically that
 * happens either by CDN or during the build process as an optimization to remove comment nodes.
 * Hydration process requires comment nodes produced by Angular to locate correct DOM segments.
 * When this special marker is *not* present - throw an error and do not proceed with hydration,
 * since it will not be able to function correctly.
 *
 * Note: this function is invoked only on the client, so it's safe to use DOM APIs.
 */
function verifySsrContentsIntegrity(): void {
  const doc = getDocument();
  let hydrationMarker: Node | undefined;
  for (const node of doc.body.childNodes) {
    if (
      node.nodeType === Node.COMMENT_NODE &&
      node.textContent?.trim() === SSR_CONTENT_INTEGRITY_MARKER
    ) {
      hydrationMarker = node;
      break;
    }
  }
  if (!hydrationMarker) {
    throw new RuntimeError(
      RuntimeErrorCode.MISSING_SSR_CONTENT_INTEGRITY_MARKER,
      typeof ngDevMode !== 'undefined' &&
        ngDevMode &&
        'Angular hydration logic detected that HTML content of this page was modified after it ' +
          'was produced during server side rendering. Make sure that there are no optimizations ' +
          'that remove comment nodes from HTML enabled on your CDN. Angular hydration ' +
          'relies on HTML produced by the server, including whitespaces and comment nodes.',
    );
  }
}
