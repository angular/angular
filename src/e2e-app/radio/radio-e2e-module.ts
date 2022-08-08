/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {SimpleRadioButtons} from './radio-e2e';

@NgModule({
  imports: [MatLegacyRadioModule],
  declarations: [SimpleRadioButtons],
})
export class RadioE2eModule {}
