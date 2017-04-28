import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, MdCommonModule} from '../core';
import {MdMenu} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';
import {MdRippleModule} from '../core/ripple/index';


@NgModule({
  imports: [
    OverlayModule,
    CommonModule,
    MdRippleModule,
    MdCommonModule,
  ],
  exports: [MdMenu, MdMenuItem, MdMenuTrigger, MdCommonModule],
  declarations: [MdMenu, MdMenuItem, MdMenuTrigger],
})
export class MdMenuModule {}


export * from './menu';
export {fadeInItems, transformMenu} from './menu-animations';
