/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ExampleModule} from '../example/example-module';
import {PopoverEditDemo} from './popover-edit-demo';

@NgModule({
  imports: [
    ExampleModule,
    FormsModule,
    RouterModule.forChild([{path: '', component: PopoverEditDemo}]),
  ],
  declarations: [PopoverEditDemo],
})
export class PopoverEditDemoModule {
}
