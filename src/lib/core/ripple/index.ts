import {ModuleWithProviders, NgModule} from '@angular/core';
import {MdRipple} from './ripple';
import {CompatibilityModule} from '../compatibility/compatibility';
import {VIEWPORT_RULER_PROVIDER} from '../overlay/position/viewport-ruler';
import {SCROLL_DISPATCHER_PROVIDER} from '../overlay/scroll/scroll-dispatcher';

export {MdRipple, RippleGlobalOptions, MD_RIPPLE_GLOBAL_OPTIONS} from './ripple';
export {RippleRef, RippleState} from './ripple-ref';
export {RippleConfig} from './ripple-renderer';

@NgModule({
  imports: [CompatibilityModule],
  exports: [MdRipple, CompatibilityModule],
  declarations: [MdRipple],
  providers: [VIEWPORT_RULER_PROVIDER, SCROLL_DISPATCHER_PROVIDER],
})
export class MdRippleModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdRippleModule,
      providers: []
    };
  }
}
