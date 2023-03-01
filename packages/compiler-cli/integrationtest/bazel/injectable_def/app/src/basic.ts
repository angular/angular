/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {Lib2Module} from 'lib2_built/module';

@Component({
  selector: 'id-app',
  template: '<lib2-cmp></lib2-cmp>',
})
export class AppComponent {
}

@NgModule({
  imports: [
    Lib2Module,
    BrowserModule.withServerTransition({appId: 'id-app'}),
    ServerModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class BasicAppModule {
}
