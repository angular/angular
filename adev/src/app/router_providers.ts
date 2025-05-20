/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, inject, provideEnvironmentInitializer} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  Router,
  withViewTransitions,
  createUrlTreeFromSnapshot,
  withComponentInputBinding,
  RouteReuseStrategy,
  TitleStrategy,
  NavigationCancel,
  NavigationError,
  NavigationStart,
  RedirectCommand,
  withNavigationErrorHandler,
  withRouterConfig,
} from '@angular/router';
import {routes} from './routes';
import {ADevTitleStrategy} from './core/services/a-dev-title-strategy';
import {ReuseTutorialsRouteStrategy} from './features/tutorial/tutorials-route-reuse-strategy';
import {AppScroller} from './app-scroller';
import {Subject} from 'rxjs/internal/Subject';
import {HttpErrorResponse} from '@angular/common/http';
import {WINDOW} from '@angular/docs';
import {merge, map} from 'rxjs';

const transitionCreated = new Subject<void>();
export const routerProviders = [
  provideRouter(
    routes,
    withInMemoryScrolling(),
    withRouterConfig({canceledNavigationResolution: 'computed'}),
    withNavigationErrorHandler(({error}) => {
      if (error instanceof HttpErrorResponse) {
        // TODO: Redirect to different pages on different response codes? (e.g. 500 page)
        return new RedirectCommand(inject(Router).parseUrl('/404'));
      }
      return void 0;
    }),
    withViewTransitions({
      onViewTransitionCreated: ({transition, to}) => {
        transitionCreated.next();
        const router = inject(Router);
        const toTree = createUrlTreeFromSnapshot(to, []);
        // Skip the transition if the only thing changing is the fragment and queryParams
        if (
          router.isActive(toTree, {
            paths: 'exact',
            matrixParams: 'exact',
            fragment: 'ignored',
            queryParams: 'ignored',
          })
        ) {
          transition.skipTransition();
        }
      },
    }),
    withComponentInputBinding(),
  ),
  {
    provide: RouteReuseStrategy,
    useClass: ReuseTutorialsRouteStrategy,
  },
  {provide: TitleStrategy, useClass: ADevTitleStrategy},
  provideEnvironmentInitializer(() => inject(AppScroller)),
  provideEnvironmentInitializer(() => initializeNavigationAdapter()),
];

/**
 * This function creates an adapter for the Router which creates a browser navigation
 * event for any Router navigations (indicated by NavigationStart). This navigation
 * is then cancelled right before the Router would commit the change to the browser
 * state through history.[push/replace]State (happens right after view transition is created)
 * or when the navigation ends without completing (NavigationCancel or NavigationError).
 *
 * In addition, it listens for the 'navigateerror' event, which would happen if the
 * user cancels the navigation using the stop button in the browser UI, pressing the escape key,
 * or initiates a document traversal (e.g. browser back/forward button). When this event
 * happens, it aborts any ongoing Router navigation.
 *
 * The benefit we get out of this is that the browser can better indicate a navigation is happening
 * when we use the Navigation API. A loading indicator appears on the tab (in desktop chrome) and the
 * refresh button changes to an "x" for stop. Site visitors can cancel the navigation using the stop
 * button or the escape key (again, on desktop).
 */
const initializeNavigationAdapter = () => {
  const router = inject(Router);
  const window = inject(WINDOW);
  const navigation = window.navigation;
  if (!navigation || !inject(DOCUMENT).startViewTransition) {
    return;
  }

  let intercept = false;
  let clearNavigation: (() => void) | undefined;
  navigation.addEventListener('navigateerror', async () => {
    if (!clearNavigation) {
      return;
    }
    clearNavigation = undefined;
    router.getCurrentNavigation()?.abort();
  });
  navigation.addEventListener('navigate', (navigateEvent) => {
    if (!intercept) {
      return;
    }
    navigateEvent.intercept({
      handler: () =>
        new Promise<void>((_, reject) => {
          clearNavigation = () => {
            clearNavigation = undefined;
            reject();
          };
        }),
    });
  });

  merge(transitionCreated.pipe(map(() => 'viewtransition')), router.events).subscribe((e) => {
    // Skip this for popstate/traversals that are already committed.
    // The rollback is problematic so we only do it for navigations that
    // defer the actual update (pushState) on the browser.
    const currentNavigation = router.getCurrentNavigation();
    if (currentNavigation?.trigger === 'popstate' || currentNavigation?.extras.replaceUrl) {
      return;
    }
    if (e instanceof NavigationStart) {
      intercept = true;
      window.history.replaceState(window.history.state, '', window.location.href);
      intercept = false;
    } else if (
      // viewtransition happens before NavigateEnd
      e === 'viewtransition' ||
      e instanceof NavigationCancel ||
      e instanceof NavigationError
    ) {
      clearNavigation?.();
    }
  });
};
