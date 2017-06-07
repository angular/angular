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
