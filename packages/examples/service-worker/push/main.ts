/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {AppComponent} from './service_worker_component';
import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {ServiceWorkerModule} from '@angular/service-worker';

const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideProtractorTestingSupport(),
    importProvidersFrom(ServiceWorkerModule.register('ngsw-worker.js')),
  ],
};

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
