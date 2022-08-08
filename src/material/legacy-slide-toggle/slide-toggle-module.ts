/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ObserversModule} from '@angular/cdk/observers';
import {NgModule} from '@angular/core';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {MatLegacySlideToggle} from './slide-toggle';
import {_MatSlideToggleRequiredValidatorModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    _MatSlideToggleRequiredValidatorModule,
    MatRippleModule,
    MatCommonModule,
    ObserversModule,
  ],
  exports: [_MatSlideToggleRequiredValidatorModule, MatLegacySlideToggle, MatCommonModule],
  declarations: [MatLegacySlideToggle],
})
export class MatLegacySlideToggleModule {}
