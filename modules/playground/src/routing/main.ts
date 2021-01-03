/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {RouterModule} from '@angular/router';

import {DbService, DraftsCmp, InboxApp, InboxCmp, ROUTER_CONFIG} from './app/inbox-app';

@NgModule({
  providers: [DbService],
  declarations: [InboxCmp, DraftsCmp, InboxApp],
  imports: [RouterModule.forRoot(ROUTER_CONFIG, {useHash: true}), BrowserModule],
  bootstrap: [InboxApp],
})
export class RoutingExampleModule {
}

platformBrowserDynamic().bootstrapModule(RoutingExampleModule);
