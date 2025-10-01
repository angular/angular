/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';
import 'zone.js/plugins/task-tracking';

// okd

import {bootstrapApplication} from '@angular/platform-browser';
import {routes, TestsAppComponent} from './test_app_component';
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideZoneChangeDetection()],
};

bootstrapApplication(TestsAppComponent, appConfig).catch((err) => console.error(err));
