import {NgModule} from '@angular/core';
import {OverlayModule, MdCommonModule} from '../core';
import {PlatformModule} from '../core/platform/index';
import {MdTooltip, TooltipComponent} from './tooltip';


@NgModule({
  imports: [OverlayModule, MdCommonModule, PlatformModule],
  exports: [MdTooltip, TooltipComponent, MdCommonModule],
  declarations: [MdTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
})
export class MdTooltipModule {}


export * from './tooltip';
