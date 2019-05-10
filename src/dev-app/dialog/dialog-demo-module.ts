/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
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
