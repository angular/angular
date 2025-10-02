/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './service_worker_component';
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';

const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection()],
};

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
