/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterModule} from '@angular/router';
import {ExampleModule} from '../example/example-module';
import {TabsDemo} from './tabs-demo';

@NgModule({
  imports: [
    ExampleModule,
    MatTabsModule,
    RouterModule.forChild([{path: '', component: TabsDemo}]),
  ],
  declarations: [TabsDemo],
})
export class TabsDemoModule {
}
