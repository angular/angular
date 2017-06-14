/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule, MdRippleModule, StyleModule} from '../core';
import {
  MdAnchor,
  MdButton,
  MdMiniFab,
  MdButtonCssMatStyler,
  MdFab,
  MdIconButtonCssMatStyler,
  MdRaisedButtonCssMatStyler
} from './button';


export * from './button';


@NgModule({
  imports: [
    CommonModule,
    MdRippleModule,
    MdCommonModule,
    StyleModule,
  ],
  exports: [
    MdButton,
    MdAnchor,
    MdMiniFab,
    MdFab,
    MdCommonModule,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
  ],
  declarations: [
    MdButton,
    MdAnchor,
    MdMiniFab,
    MdFab,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
  ],
})
export class MdButtonModule {}
