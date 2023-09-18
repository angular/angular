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

/**
 * A helper function for using browser view transitions. This function skips the call to
 * `startViewTransition` if the browser does not support it.
 *
 * @returns A Promise that resolves when the view transition callback begins.
 */
export function createViewTransition(injector: Injector): Promise<void> {
  // Create promises outside the Angular zone to avoid causing extra change detections
  return injector.get(NgZone).runOutsideAngular(() => {
    const document = injector.get(DOCUMENT);
    if (!document.startViewTransition) {
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
