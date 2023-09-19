/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="@types/dom-view-transitions" />

import {DOCUMENT} from '@angular/common';
import {afterNextRender, InjectionToken, Injector, NgZone} from '@angular/core';

export const CREATE_VIEW_TRANSITION =
    new InjectionToken<typeof createViewTransition>(ngDevMode ? 'view transition helper' : '');
export const VIEW_TRANSITION_OPTIONS =
    new InjectionToken<{skipNextTransition: boolean}>(ngDevMode ? 'view transition options' : '');

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
}

/**
 * A helper function for using browser view transitions. This function skips the call to
 * `startViewTransition` if the browser does not support it.
 *
 * @returns A Promise that resolves when the view transition callback begins.
 */
export function createViewTransition(injector: Injector): Promise<void> {
  const transitionOptions = injector.get(VIEW_TRANSITION_OPTIONS);
  const document = injector.get(DOCUMENT);
  // Create promises outside the Angular zone to avoid causing extra change detections
  return injector.get(NgZone).runOutsideAngular(() => {
    if (!document.startViewTransition || transitionOptions.skipNextTransition) {
      transitionOptions.skipNextTransition = false;
      return Promise.resolve();
    }

    let resolveViewTransitionStarted: () => void;
    const viewTransitionStarted = new Promise<void>((resolve) => {
      resolveViewTransitionStarted = resolve;
    });
    document.startViewTransition(() => {
      resolveViewTransitionStarted();
      return createRenderPromise(injector);
    });
    return viewTransitionStarted;
  });
}

/**
 * Creates a promise that resolves after next render.
 */
function createRenderPromise(injector: Injector) {
  return new Promise<void>(resolve => {
    afterNextRender(resolve, {injector});
  });
}
