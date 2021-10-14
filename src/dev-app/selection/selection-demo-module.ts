/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkSelectionExamplesModule} from '@angular/components-examples/cdk-experimental/selection';
import {MatSelectionExamplesModule} from '@angular/components-examples/material-experimental/selection';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {SelectionDemo} from './selection-demo';

@NgModule({
  imports: [
    CdkSelectionExamplesModule,
    MatSelectionExamplesModule,
    FormsModule,
    RouterModule.forChild([{path: '', component: SelectionDemo}]),
  ],
  declarations: [SelectionDemo],
})
export class SelectionDemoModule {}
