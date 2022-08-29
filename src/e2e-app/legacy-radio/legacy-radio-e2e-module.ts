/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {LegacyRadioE2e} from './legacy-radio-e2e';

@NgModule({
  imports: [MatLegacyRadioModule],
  declarations: [LegacyRadioE2e],
})
export class LegacyRadioE2eModule {}
