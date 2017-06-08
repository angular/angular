import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSelect} from './select';
import {MdCommonModule, OverlayModule, MdOptionModule} from '../core';


@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MdOptionModule,
    MdCommonModule,
  ],
  exports: [MdSelect, MdOptionModule, MdCommonModule],
  declarations: [MdSelect],
})
export class MdSelectModule {}


export * from './select';
export {fadeInContent, transformPanel, transformPlaceholder} from './select-animations';
