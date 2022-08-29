/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {LegacyCheckboxE2e} from './legacy-checkbox-e2e';

@NgModule({
  imports: [MatLegacyCheckboxModule],
  declarations: [LegacyCheckboxE2e],
})
export class LegacyCheckboxE2eModule {}
