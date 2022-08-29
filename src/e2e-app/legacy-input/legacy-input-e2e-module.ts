/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {LegacyInputE2e} from './legacy-input-e2e';

@NgModule({
  imports: [MatLegacyFormFieldModule, MatLegacyInputModule],
  declarations: [LegacyInputE2e],
})
export class LegacyInputE2eModule {}
