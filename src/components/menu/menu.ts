import {Component, Directive, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-menu',
  host: {'role': 'menu'},
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mdMenu'
})
export class MdMenu {}

@Directive({
  selector: '[md-menu-item]',
  host: {'role': 'menuitem'}
})
export class MdMenuItem {}

export const MD_MENU_DIRECTIVES = [MdMenu, MdMenuItem];

