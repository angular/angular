/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {
  ApplicationConfig,
  ENVIRONMENT_INITIALIZER,
  ErrorHandler,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  DOCS_CONTENT_LOADER,
  ENVIRONMENT,
  EXAMPLE_VIEWER_CONTENT_LOADER,
  PREVIEWS_COMPONENTS,
  WINDOW,
  windowProvider,
} from '@angular/docs';
import {provideClientHydration} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {
  RouteReuseStrategy,
  Router,
  TitleStrategy,
  createUrlTreeFromSnapshot,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import environment from './environment';
import {PREVIEWS_COMPONENTS_MAP} from './../assets/previews/previews';
import {ADevTitleStrategy} from './core/services/a-dev-title-strategy';
import {AnalyticsService} from './core/services/analytics/analytics.service';
import {ContentLoader} from './core/services/content-loader.service';
import {CustomErrorHandler} from './core/services/errors-handling/error-handler';
import {ExampleContentLoader} from './core/services/example-content-loader.service';
import {ReuseTutorialsRouteStrategy} from './features/tutorial/tutorials-route-reuse-strategy';
import {routes} from './routes';
import {ReferenceScrollHandler} from './features/references/services/reference-scroll-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled'}),
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
    ),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    {provide: ENVIRONMENT, useValue: environment},
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(AnalyticsService),
    },
    {provide: ErrorHandler, useClass: CustomErrorHandler},
    {provide: PREVIEWS_COMPONENTS, useValue: PREVIEWS_COMPONENTS_MAP},
    {provide: DOCS_CONTENT_LOADER, useClass: ContentLoader},
    {provide: EXAMPLE_VIEWER_CONTENT_LOADER, useClass: ExampleContentLoader},
    {
      provide: RouteReuseStrategy,
      useClass: ReuseTutorialsRouteStrategy,
    },
    {
      provide: WINDOW,
      useFactory: (document: Document) => windowProvider(document),
      deps: [DOCUMENT],
    },
    {provide: TitleStrategy, useClass: ADevTitleStrategy},
    provideZoneChangeDetection({eventCoalescing: true}),
    ReferenceScrollHandler,
  ],
};
