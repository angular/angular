/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  inject,
  Injector,
  afterNextRender,
  ENVIRONMENT_INITIALIZER,
  ApplicationRef,
} from '@angular/core';
import {WINDOW} from '@angular/docs';
import {ɵafterNextNavigation as afterNextNavigation, Router} from '@angular/router';
import {firstValueFrom, filter, take} from 'rxjs';

/**
 * An environment initializer that listens for browser navigate events,
 * makes the browser navigation transition wait for the Angular Router navigation to fully render,
 * and then restores scroll position and focus.
 */
export const SCROLL_INITIALIZER = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useFactory: () => {
    const window = inject(WINDOW);
    const injector = inject(Injector);
    const router = inject(Router);
    const applicationRef = inject(ApplicationRef);
    return () => {
      const navigation = window.navigation;
      if (!navigation) {
        return;
      }
      navigation.addEventListener('navigate', (navigateEvent) => {
        if (!navigateEvent.canIntercept) {
          return;
        }
        navigateEvent.intercept({
          scroll: 'manual',
          // Wait for router to respond to and process this navigation
          handler: () =>
            waitForFullNavigationRender(router, injector, applicationRef, navigateEvent),
        });
      });
    };
  },
};

async function waitForFullNavigationRender(
  router: Router,
  injector: Injector,
  applicationRef: ApplicationRef,
  navigateEvent: NavigateEvent,
) {
  // Wait for the Router to process the navigation event and finish navigating
  await afterNextNavigationPromise(router);
  // Wait for Angular to run change detection, which activates routes
  await afterNextRenderPromise(injector);
  // Wait for any pending render tasks that might have happened when activating routes
  await afterStablePromise(applicationRef);
  navigateEvent.scroll();
}

/** Creates a promise that resolves after the next render */
function afterNextRenderPromise(injector: Injector) {
  return new Promise<void>((resolve) => {
    afterNextRender(resolve, {injector});
  });
}

function afterNextNavigationPromise(router: Router) {
  return new Promise<void>((resolve) => {
    afterNextNavigation(router, resolve);
  });
}

function afterStablePromise(applicationRef: ApplicationRef) {
  return firstValueFrom(
    applicationRef.isStable.pipe(
      filter((stable) => stable),
      take(1),
    ),
  );
}
