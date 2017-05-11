import {NgModule} from '@angular/core';
import {MdRipple} from './ripple';
import {MdCommonModule} from '../common-behaviors/common-module';
import {VIEWPORT_RULER_PROVIDER} from '../overlay/position/viewport-ruler';
import {ScrollDispatchModule} from '../overlay/scroll/index';
import {PlatformModule} from '../platform/index';

export {MdRipple, RippleGlobalOptions, MD_RIPPLE_GLOBAL_OPTIONS} from './ripple';
export {RippleRef, RippleState} from './ripple-ref';
export {RippleConfig, RIPPLE_FADE_IN_DURATION, RIPPLE_FADE_OUT_DURATION} from './ripple-renderer';

@NgModule({
  imports: [MdCommonModule, PlatformModule, ScrollDispatchModule],
  exports: [MdRipple, MdCommonModule],
  declarations: [MdRipple],
  providers: [VIEWPORT_RULER_PROVIDER],
})
export class MdRippleModule {}
