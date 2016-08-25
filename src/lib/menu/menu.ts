import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OVERLAY_PROVIDERS} from '@angular2-material/core/core';
import {MdMenu} from './menu-directive';
import {MdMenuItem, MdMenuAnchor} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';
export {MdMenu} from './menu-directive';
export {MdMenuItem, MdMenuAnchor} from './menu-item';
export {MdMenuTrigger} from './menu-trigger';


@NgModule({
  imports: [OverlayModule, CommonModule],
  exports: [MdMenu, MdMenuItem, MdMenuTrigger, MdMenuAnchor],
  declarations: [MdMenu, MdMenuItem, MdMenuTrigger, MdMenuAnchor],
})
export class MdMenuModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdMenuModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}
