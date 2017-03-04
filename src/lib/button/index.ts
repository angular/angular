import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdRippleModule, CompatibilityModule} from '../core';
import {
  MdButton,
  MdAnchor,
  MdButtonCssMatStyler,
  MdRaisedButtonCssMatStyler,
  MdIconButtonCssMatStyler,
  MdFabCssMatStyler,
  MdMiniFabCssMatStyler,
} from './button';


@NgModule({
  imports: [CommonModule, MdRippleModule, CompatibilityModule],
  exports: [
    MdButton,
    MdAnchor,
    CompatibilityModule,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
    MdFabCssMatStyler,
    MdMiniFabCssMatStyler
  ],
  declarations: [
    MdButton,
    MdAnchor,
    MdButtonCssMatStyler,
    MdRaisedButtonCssMatStyler,
    MdIconButtonCssMatStyler,
    MdFabCssMatStyler,
    MdMiniFabCssMatStyler
  ],
})
export class MdButtonModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdButtonModule,
      providers: []
    };
  }
}


export * from './button';
