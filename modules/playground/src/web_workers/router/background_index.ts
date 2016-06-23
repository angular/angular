/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {WORKER_APP_LOCATION_PROVIDERS} from '@angular/platform-browser';
import {bootstrapWorkerApp} from '@angular/platform-browser-dynamic';

import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {App} from './index_common';

export function main() {
  bootstrapWorkerApp(App, [
    ROUTER_PROVIDERS,
    WORKER_APP_LOCATION_PROVIDERS,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]);
}
