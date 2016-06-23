/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InboxApp} from './app/inbox-app';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';

export function main() {
  bootstrap(InboxApp,
            [ROUTER_PROVIDERS, {provide: LocationStrategy, useClass: HashLocationStrategy}]);
}
