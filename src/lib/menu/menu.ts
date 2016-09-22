import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OVERLAY_PROVIDERS} from '../core';
import {MdMenu} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';
export {MdMenu} from './menu-directive';
export {MdMenuItem} from './menu-item';
export {MdMenuTrigger} from './menu-trigger';


@NgModule({
  imports: [OverlayModule, CommonModule],
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
