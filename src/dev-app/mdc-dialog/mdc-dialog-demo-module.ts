/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material-experimental/mdc-dialog';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';
import {RouterModule} from '@angular/router';
import {ContentElementDialog, DialogDemo, IFrameDialog, JazzDialog} from './mdc-dialog-demo';

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule.forChild([{path: '', component: DialogDemo}]),
  ],
  declarations: [ContentElementDialog, DialogDemo, IFrameDialog, JazzDialog],
})
export class MdcDialogDemoModule {}
