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
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RedirectCommand,
  withNavigationErrorHandler,
  withRouterConfig,
  isActive,
} from '@angular/router';
import {routes} from './routes';
import {ADevTitleStrategy} from '../core/services/a-dev-title-strategy';
import {ReuseTutorialsRouteStrategy} from '../features/tutorial/tutorials-route-reuse-strategy';
import {AppScroller} from '../app-scroller';
import {Subject} from 'rxjs/internal/Subject';
import {HttpErrorResponse} from '@angular/common/http';
import {WINDOW} from '@angular/docs';
import {merge, map, filter, first} from 'rxjs';

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
        const isTargetRouteCurrent = isActive(toTree, router, {
          paths: 'exact',
          matrixParams: 'exact',
          fragment: 'ignored',
          queryParams: 'ignored',
        });

        if (isTargetRouteCurrent()) {
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
  provideEnvironmentInitializer(() => preserveTextFragmentHighlight()),
];

/**
 * Preserves browser text fragment highlights (`:~:text=...`) during the initial
 * navigation. Chrome and other browsers clear text fragment highlights whenever
 * `history.pushState` or `history.replaceState` is called. During Angular's
 * initial navigation, the router calls `replaceState` to update the history
 * state with a `navigationId`, which strips the highlight.
 *
 * This function temporarily suppresses `pushState`/`replaceState` calls on
 * the initial navigation when text fragment support is detected, and restores
 * the original methods after the first navigation completes.
 */
const preserveTextFragmentHighlight = () => {
  const document = inject(DOCUMENT);
  const window = inject(WINDOW);

  // Only activate when the browser supports text fragment directives.
  if (!('fragmentDirective' in document)) {
    return;
  }

  const history = window.history;
  const originalReplaceState = history.replaceState.bind(history);
  const originalPushState = history.pushState.bind(history);

  // Suppress replaceState/pushState to prevent clearing the text highlight.
  history.replaceState = () => {};
  history.pushState = () => {};

  // Restore after the first navigation completes (or fails/cancels).
  const router = inject(Router);
  router.events
    .pipe(
      filter(
        (e) =>
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError,
      ),
      first(),
    )
    .subscribe(() => {
      history.replaceState = originalReplaceState;
      history.pushState = originalPushState;
    });
};

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
    router.currentNavigation()?.abort();
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
    const currentNavigation = router.currentNavigation();
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
