/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InboxApp, ROUTER_CONFIG} from './app/inbox-app';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {provideRouter} from '@angular/router';

export function main() {
  bootstrap(InboxApp, [
    provideRouter(ROUTER_CONFIG),
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]);
}
