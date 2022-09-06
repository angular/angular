/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatLegacyRadioButton, MatLegacyRadioGroup} from './radio';

/**
 * @deprecated Use `MatRadioModule` from `@angular/material/radio` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  imports: [MatRippleModule, MatCommonModule],
  exports: [MatLegacyRadioGroup, MatLegacyRadioButton, MatCommonModule],
  declarations: [MatLegacyRadioGroup, MatLegacyRadioButton],
})
export class MatLegacyRadioModule {}
