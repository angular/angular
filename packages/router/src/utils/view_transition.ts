/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="@types/dom-view-transitions" />

import {afterNextRender, InjectionToken, Injector, NgZone} from '@angular/core';

export const CREATE_VIEW_TRANSITION =
    new InjectionToken<typeof transitionHelper>(ngDevMode ? 'view transition helper' : '');

/**
 * A helper function for using browser view transitions. This function skips the call to
 * `startViewTransition` if the browser does not support it.
 *
 * @returns An Observable that completes when the `ViewTransition.updateCallbackDone` promise
 *     resolves.
 */
export function transitionHelper(injector: Injector):
    {viewTransitionStarted: Promise<void>, transition: ViewTransition} {
  // Create promises outside the Angular zone to avoid causing extra change detections
  return injector.get(NgZone).runOutsideAngular(() => {
    if (!document.startViewTransition) {
      // Ensure the timing of the update and finish promises are the same even when view transitions
      // aren't supported by the browser. That is, resolve it after the next render in both cases.
      const renderPromise = createRenderPromise(injector);
      const transition: ViewTransition = {
        ready: Promise.resolve(),
        updateCallbackDone: renderPromise,
        finished: renderPromise,
        skipTransition: () => {},
      };
      return {
        transition,
        viewTransitionStarted: Promise.resolve(),
      };
    } else {
      let resolveViewTransitionStarted: () => void;
      const viewTransitionStarted = new Promise<void>((resolve) => {
        resolveViewTransitionStarted = resolve;
      });
      const transition = document.startViewTransition(() => {
        resolveViewTransitionStarted();
        return createRenderPromise(injector);
      });
      return {transition, viewTransitionStarted};
    }
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
