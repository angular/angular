import {NgModule, ModuleWithProviders} from '@angular/core';
import {OverlayModule, CompatibilityModule} from '../core';
import {PlatformModule} from '../core/platform/index';
import {MdTooltip, TooltipComponent} from './tooltip';


@NgModule({
  imports: [OverlayModule, CompatibilityModule, PlatformModule],
  exports: [MdTooltip, TooltipComponent, CompatibilityModule],
  declarations: [MdTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
})
export class MdTooltipModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTooltipModule,
      providers: []
    };
  }
}


export * from './tooltip';
