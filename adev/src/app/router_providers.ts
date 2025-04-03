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
} from '@angular/router';
import {routes} from './routes';
import {ADevTitleStrategy} from './core/services/a-dev-title-strategy';
import {ReuseTutorialsRouteStrategy} from './features/tutorial/tutorials-route-reuse-strategy';
import {AppScroller} from './app-scroller';

export const routerProviders = [
  provideRouter(
    routes,
    withInMemoryScrolling(),
    withViewTransitions({
      onViewTransitionCreated: ({transition, to}) => {
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
];
