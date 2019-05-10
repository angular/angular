/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {DialogE2E, TestDialog} from './dialog-e2e';

@NgModule({
  imports: [MatDialogModule],
  declarations: [DialogE2E, TestDialog],
  entryComponents: [TestDialog]
})
export class DialogE2eModule {
}
