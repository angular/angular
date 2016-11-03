import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OVERLAY_PROVIDERS} from '../core';
import {MdMenu} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';
import {MdRippleModule} from '../core/ripple/ripple';
export {MdMenu} from './menu-directive';
export {MdMenuItem} from './menu-item';
export {MdMenuTrigger} from './menu-trigger';
export {MdMenuPanel} from './menu-panel';
export {MenuPositionX, MenuPositionY} from './menu-positions';


@NgModule({
  imports: [OverlayModule, CommonModule, MdRippleModule],
  exports: [MdMenu, MdMenuItem, MdMenuTrigger],
  declarations: [MdMenu, MdMenuItem, MdMenuTrigger],
})
export class MdMenuModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdMenuModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}
