/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
import {LegacyProgressBarE2e} from './legacy-progress-bar-e2e';

@NgModule({
  imports: [MatLegacyProgressBarModule],
  declarations: [LegacyProgressBarE2e],
})
export class LegacyProgressBarE2eModule {}
