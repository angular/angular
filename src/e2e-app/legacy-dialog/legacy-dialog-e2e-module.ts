/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyDialogModule} from '@angular/material/legacy-dialog';
import {LegacyDialogE2e, TestDialog} from './legacy-dialog-e2e';

@NgModule({
  imports: [MatLegacyDialogModule],
  declarations: [LegacyDialogE2e, TestDialog],
})
export class LegacyDialogE2eModule {}
