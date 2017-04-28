import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule, MdRippleModule, StyleModule} from '../core';
import {
  MdAnchor,
  MdButton,
  MdButtonCssMatStyler,
  MdFabCssMatStyler,
  MdIconButtonCssMatStyler,
  MdMiniFabCssMatStyler,
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
    MdCommonModule,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
    MdFabCssMatStyler,
    MdMiniFabCssMatStyler,
  ],
  declarations: [
    MdButton,
    MdAnchor,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
    MdFabCssMatStyler,
    MdMiniFabCssMatStyler,
  ],
})
export class MdButtonModule {}
