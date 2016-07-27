/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InboxApp, InboxCmp, DraftsCmp, DbService, ROUTER_CONFIG} from './app/inbox-app';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {RouterModule} from '@angular/router';

export function main() {
  bootstrap(InboxApp, {
    providers: [
      DbService
    ],
    declarations: [InboxCmp, DraftsCmp],
    imports: [RouterModule.forRoot(ROUTER_CONFIG, {useHash: true})]
  });
}
