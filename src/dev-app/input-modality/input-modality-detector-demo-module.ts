/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {RouterModule} from '@angular/router';
import {InputModalityDetectorDemo} from './input-modality-detector-demo';

@NgModule({
  imports: [
    A11yModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    RouterModule.forChild([{path: '', component: InputModalityDetectorDemo}]),
  ],
  declarations: [InputModalityDetectorDemo],
})
export class InputModalityDetectorDemoModule {}
