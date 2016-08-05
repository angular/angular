/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {RouterModule} from '@angular/router';

import {DbService, DraftsCmp, InboxApp, InboxCmp, ROUTER_CONFIG} from './app/inbox-app';

export function main() {
  bootstrap(InboxApp, {
    providers: [DbService],
    declarations: [InboxCmp, DraftsCmp],
    imports: [RouterModule.forRoot(ROUTER_CONFIG, {useHash: true})]
  });
}
