/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule} from '@angular/material/core';
import {MatLegacyProgressSpinner} from './progress-spinner';

/**
 * @deprecated Use `MatProgressSpinnerModule` from `@angular/material/progress-spinner` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  imports: [MatCommonModule, CommonModule],
  exports: [MatLegacyProgressSpinner, MatCommonModule],
  declarations: [MatLegacyProgressSpinner],
})
export class MatLegacyProgressSpinnerModule {}
