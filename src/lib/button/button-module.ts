/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCommonModule, MatRippleModule} from '@angular/material/core';
import {A11yModule} from '@angular/cdk/a11y';
import {
  MatAnchor,
  MatButton,
  MatMiniFab,
  MatButtonCssMatStyler,
  MatFab,
  MatIconButtonCssMatStyler,
  MatRaisedButtonCssMatStyler
} from './button';


@NgModule({
  imports: [
    CommonModule,
    MatRippleModule,
    MatCommonModule,
    A11yModule,
  ],
  exports: [
    MatButton,
    MatAnchor,
    MatMiniFab,
    MatFab,
    MatCommonModule,
    MatButtonCssMatStyler,
    MatRaisedButtonCssMatStyler,
    MatIconButtonCssMatStyler,
  ],
  declarations: [
    MatButton,
    MatAnchor,
    MatMiniFab,
    MatFab,
    MatButtonCssMatStyler,
    MatRaisedButtonCssMatStyler,
    MatIconButtonCssMatStyler,
  ],
})
export class MatButtonModule {}
