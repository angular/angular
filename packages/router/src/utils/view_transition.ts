/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="dom-view-transitions" />

import {DOCUMENT} from '@angular/common';
import {
  afterNextRender,
  InjectionToken,
  Injector,
  NgZone,
  runInInjectionContext,
} from '@angular/core';

import {ActivatedRouteSnapshot} from '../router_state';

export const CREATE_VIEW_TRANSITION = new InjectionToken<typeof createViewTransition>(
  ngDevMode ? 'view transition helper' : '',
);
export const VIEW_TRANSITION_OPTIONS = new InjectionToken<
  ViewTransitionsFeatureOptions & {skipNextTransition: boolean}
>(ngDevMode ? 'view transition options' : '');

/**
 * Options to configure the View Transitions integration in the Router.
 *
 * @experimental
 * @publicApi
 * @see withViewTransitions
 */
export interface ViewTransitionsFeatureOptions {
  /**
   * Skips the very first call to `startViewTransition`. This can be useful for disabling the
   * animation during the application's initial loading phase.
   */
  skipInitialTransition?: boolean;

  /**
   * A function to run after the `ViewTransition` is created.
   *
   * This function is run in an injection context and can use `inject`.
   */
  onViewTransitionCreated?: (transitionInfo: ViewTransitionInfo) => void;
}

/**
 * The information passed to the `onViewTransitionCreated` function provided in the
 * `withViewTransitions` feature options.
 *
 * @publicApi
 * @experimental
 */
export interface ViewTransitionInfo {
  // TODO(atscott): This type can/should be the built-in `ViewTransition` type
  // from @types/dom-view-transitions but exporting that type from the public API is currently not
  // supported by tooling.
  /**
   * The `ViewTransition` returned by the call to `startViewTransition`.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition
   */
  transition: {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/finished
     */
    finished: Promise<void>;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/ready
     */
    ready: Promise<void>;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/updateCallbackDone
     */
    updateCallbackDone: Promise<void>;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/skipTransition
     */
    skipTransition(): void;
  };
  /**
   * The `ActivatedRouteSnapshot` that the navigation is transitioning from.
   */
  from: ActivatedRouteSnapshot;
  /**
   * The `ActivatedRouteSnapshot` that the navigation is transitioning to.
   */
  to: ActivatedRouteSnapshot;
}

/**
 * A helper function for using browser view transitions. This function skips the call to
 * `startViewTransition` if the browser does not support it.
 *
 * @returns A Promise that resolves when the view transition callback begins.
 */
export function createViewTransition(
  injector: Injector,
  from: ActivatedRouteSnapshot,
  to: ActivatedRouteSnapshot,
): Promise<void> {
  const transitionOptions = injector.get(VIEW_TRANSITION_OPTIONS);
  const document = injector.get(DOCUMENT);
  // Create promises outside the Angular zone to avoid causing extra change detections
  return injector.get(NgZone).runOutsideAngular(() => {
    if (!document.startViewTransition || transitionOptions.skipNextTransition) {
      transitionOptions.skipNextTransition = false;
      // The timing of `startViewTransition` is closer to a macrotask. It won't be called
      // until the current event loop exits so we use a promise resolved in a timeout instead
      // of Promise.resolve().
      return new Promise((resolve) => setTimeout(resolve));
    }

    let resolveViewTransitionStarted: () => void;
    const viewTransitionStarted = new Promise<void>((resolve) => {
      resolveViewTransitionStarted = resolve;
    });
    const transition = document.startViewTransition(() => {
      resolveViewTransitionStarted();
      // We don't actually update dom within the transition callback. The resolving of the above
      // promise unblocks the Router navigation, which synchronously activates and deactivates
      // routes (the DOM update). This view transition waits for the next change detection to
      // complete (below), which includes the update phase of the routed components.
      return createRenderPromise(injector);
    });
    const {onViewTransitionCreated} = transitionOptions;
    if (onViewTransitionCreated) {
      runInInjectionContext(injector, () => onViewTransitionCreated({transition, from, to}));
    }
    return viewTransitionStarted;
  });
}

/**
 * Creates a promise that resolves after next render.
 */
function createRenderPromise(injector: Injector) {
  return new Promise<void>((resolve) => {
    afterNextRender(resolve, {injector});
  });
}
