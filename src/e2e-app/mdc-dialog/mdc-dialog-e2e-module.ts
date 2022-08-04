/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MdcDialogE2E, TestDialog} from './mdc-dialog-e2e';

@NgModule({
  imports: [MatDialogModule],
  declarations: [MdcDialogE2E, TestDialog],
})
export class MdcDialogE2eModule {}
