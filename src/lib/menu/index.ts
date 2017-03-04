import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, CompatibilityModule} from '../core';
import {MdMenu} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';
import {MdRippleModule} from '../core/ripple/index';


@NgModule({
  imports: [OverlayModule, CommonModule, MdRippleModule, CompatibilityModule],
  exports: [MdMenu, MdMenuItem, MdMenuTrigger, CompatibilityModule],
  declarations: [MdMenu, MdMenuItem, MdMenuTrigger],
})
export class MdMenuModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdMenuModule,
      providers: [],
    };
  }
}


export * from './menu';
export {MdMenuTrigger} from './menu-trigger';
export {fadeInItems, transformMenu} from './menu-animations';
export {MdMenu} from './menu-directive';
export {MdMenuItem} from './menu-item';
