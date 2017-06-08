import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdRippleModule} from '../ripple/index';
import {MdSelectionModule} from '../selection/index';
import {MdOption} from './option';
import {MdOptgroup} from './optgroup';


@NgModule({
  imports: [MdRippleModule, CommonModule, MdSelectionModule],
  exports: [MdOption, MdOptgroup],
  declarations: [MdOption, MdOptgroup]
})
export class MdOptionModule {}


export * from './option';
export * from './optgroup';
