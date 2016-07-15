/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {provideRouter} from '@angular/router';
import {WORKER_APP_LOCATION_PROVIDERS} from '@angular/platform-browser';
import {bootstrapWorkerApp} from '@angular/platform-browser-dynamic';

import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {App, ROUTES} from './index_common';

export function main() {
  bootstrapWorkerApp(App, [
    provideRouter(ROUTES),
    WORKER_APP_LOCATION_PROVIDERS,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]);
}
