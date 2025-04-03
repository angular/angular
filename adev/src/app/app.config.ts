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
  ErrorHandler,
  VERSION,
  inject,
  provideExperimentalZonelessChangeDetection,
  provideEnvironmentInitializer,
} from '@angular/core';
import {
  DOCS_CONTENT_LOADER,
  ENVIRONMENT,
  EXAMPLE_VIEWER_CONTENT_LOADER,
  PREVIEWS_COMPONENTS,
  provideAlgoliaSearchClient,
  WINDOW,
  windowProvider,
} from '@angular/docs';
import {provideClientHydration} from '@angular/platform-browser';
import environment from './environment';
import {PREVIEWS_COMPONENTS_MAP} from './../assets/previews/previews';
import {AnalyticsService} from './core/services/analytics/analytics.service';
import {ContentLoader} from './core/services/content-loader.service';
import {CustomErrorHandler} from './core/services/errors-handling/error-handler';
import {ExampleContentLoader} from './core/services/example-content-loader.service';
import {CURRENT_MAJOR_VERSION} from './core/providers/current-version';
import {routerProviders} from './router_providers';

export const appConfig: ApplicationConfig = {
  providers: [
    routerProviders,
    provideExperimentalZonelessChangeDetection(),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideEnvironmentInitializer(() => inject(AnalyticsService)),
    provideAlgoliaSearchClient(environment),
    {
      provide: CURRENT_MAJOR_VERSION,
      useValue: Number(VERSION.major),
    },
    {provide: ENVIRONMENT, useValue: environment},
    {provide: ErrorHandler, useClass: CustomErrorHandler},
    {provide: PREVIEWS_COMPONENTS, useValue: PREVIEWS_COMPONENTS_MAP},
    {provide: DOCS_CONTENT_LOADER, useClass: ContentLoader},
    {provide: EXAMPLE_VIEWER_CONTENT_LOADER, useClass: ExampleContentLoader},
    {
      provide: WINDOW,
      useFactory: (document: Document) => windowProvider(document),
      deps: [DOCUMENT],
    },
  ],
};
