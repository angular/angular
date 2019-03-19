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
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ContentElementDialog, DialogDemo, IFrameDialog, JazzDialog} from './dialog-demo';

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
  entryComponents: [ContentElementDialog, IFrameDialog, JazzDialog],
})
export class DialogDemoModule {
}
