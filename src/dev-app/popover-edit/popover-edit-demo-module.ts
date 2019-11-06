/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  CdkPopoverEditExamplesModule
} from '@angular/material-examples/cdk-experimental/popover-edit/module';
import {
  PopoverEditExamplesModule
} from '@angular/material-examples/material-experimental/popover-edit/module';
import {RouterModule} from '@angular/router';
import {PopoverEditDemo} from './popover-edit-demo';

@NgModule({
  imports: [
    CdkPopoverEditExamplesModule,
    PopoverEditExamplesModule,
    FormsModule,
    RouterModule.forChild([{path: '', component: PopoverEditDemo}]),
  ],
  declarations: [PopoverEditDemo],
})
export class PopoverEditDemoModule {
}
