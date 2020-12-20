/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, NgModule, Optional, Self} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {RouterModule} from '@angular/router';

import {LazyModuleNgFactory} from './root_lazy.ngfactory';

@Component({
  selector: 'root-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
}

export function children(): any {
  console.error('children', LazyModuleNgFactory);
  return LazyModuleNgFactory;
}


@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'id-app'}),
    ServerModule,
    RouterModule.forRoot(
        [
          {path: '', pathMatch: 'prefix', loadChildren: children},
        ],
        {initialNavigation: 'enabled'}),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class RootAppModule {
}
