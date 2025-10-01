/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';

import {routes, TestsAppComponent} from './test_app';

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection(),
    provideProtractorTestingSupport(),
  ],
};

bootstrapApplication(TestsAppComponent, appConfig).catch((err) => console.error(err));
