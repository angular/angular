/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, provideEnvironmentInitializer} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  Router,
  withViewTransitions,
  createUrlTreeFromSnapshot,
  withComponentInputBinding,
  RouteReuseStrategy,
  TitleStrategy,
  RedirectCommand,
  withNavigationErrorHandler,
  withRouterConfig,
  withExperimentalPlatformNavigation,
  isActive,
} from '@angular/router';
import {routes} from './routes';
import {ADevTitleStrategy} from '../core/services/a-dev-title-strategy';
import {ReuseTutorialsRouteStrategy} from '../features/tutorial/tutorials-route-reuse-strategy';
import {AppScroller} from '../app-scroller';
import {HttpErrorResponse} from '@angular/common/http';

/**
 * Integrates the Router with the browser's Navigation API, which lets the browser indicate an
 * ongoing navigation (loading indicator on the tab, refresh button turns into "stop") and lets
 * visitors cancel it with the stop button or the escape key.
 *
 * Only enabled when the Navigation API is available: it is not supported by all browsers yet, and
 * it doesn't exist on the server (SSR/prerendering).
 */
const isPlatformNavigationSupported =
  typeof window !== 'undefined' && (window as {navigation?: unknown}).navigation !== undefined;

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
    ...(isPlatformNavigationSupported ? [withExperimentalPlatformNavigation()] : []),
  ),
  {
    provide: RouteReuseStrategy,
    useClass: ReuseTutorialsRouteStrategy,
  },
  {provide: TitleStrategy, useClass: ADevTitleStrategy},
  provideEnvironmentInitializer(() => inject(AppScroller)),
];
