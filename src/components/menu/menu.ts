import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-menu',
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdMenu {}

export const MD_MENU_DIRECTIVES = [MdMenu];

