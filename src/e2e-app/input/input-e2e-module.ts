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
import {InputE2E} from './input-e2e';

@NgModule({
  imports: [MatLegacyFormFieldModule, MatLegacyInputModule],
  declarations: [InputE2E],
})
export class InputE2eModule {}
