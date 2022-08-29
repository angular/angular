/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {LegacyProgressSpinnerE2e} from './legacy-progress-spinner-e2e';

@NgModule({
  imports: [MatLegacyProgressSpinnerModule],
  declarations: [LegacyProgressSpinnerE2e],
})
export class LegacyProgressSpinnerE2eModule {}
