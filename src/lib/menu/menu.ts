import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular2-material/core/core';
import {MdMenu} from './menu-directive';
import {MdMenuItem, MdMenuAnchor} from './menu-item';
import {MdMenuTrigger} from './menu-trigger';

export {MdMenu} from './menu-directive';
export {MdMenuItem, MdMenuAnchor} from './menu-item';
export {MdMenuTrigger} from './menu-trigger';

/** @deprecated */
export const MD_MENU_DIRECTIVES = [MdMenu, MdMenuItem, MdMenuTrigger, MdMenuAnchor];


@NgModule({
  imports: [OverlayModule, CommonModule],
  exports: MD_MENU_DIRECTIVES,
  declarations: MD_MENU_DIRECTIVES,
})
export class MdMenuModule { }
