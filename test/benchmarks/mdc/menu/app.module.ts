/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';

/** component: mdc-menu */

@Component({
  selector: 'app-root',
  templateUrl: './menu.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material-experimental/mdc-core/theming/prebuilt/indigo-pink.css'],
})
export class MenuBenchmarkApp {}

@NgModule({
  declarations: [MenuBenchmarkApp],
  imports: [BrowserModule, MatMenuModule],
  bootstrap: [MenuBenchmarkApp],
})
export class AppModule {}
