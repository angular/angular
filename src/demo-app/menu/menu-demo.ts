import {Component} from '@angular/core';
import {MD_MENU_DIRECTIVES} from '@angular2-material/menu/menu-trigger';
import {MD_ICON_DIRECTIVES} from '@angular2-material/icon/icon';
import {MD_BUTTON_DIRECTIVES} from '@angular2-material/button/button';
import {MD_TOOLBAR_DIRECTIVES} from '@angular2-material/toolbar/toolbar';

@Component({
  moduleId: module.id,
  selector: 'menu-demo',
  templateUrl: 'menu-demo.html',
  styleUrls: ['menu-demo.css'],
  directives: [
    MD_MENU_DIRECTIVES,
    MD_ICON_DIRECTIVES,
    MD_BUTTON_DIRECTIVES,
    MD_TOOLBAR_DIRECTIVES,
  ]
})
export class MenuDemo {
  selected = '';
  items = [
    {text: 'Refresh'},
    {text: 'Settings'},
    {text: 'Help'},
    {text: 'Sign Out', disabled: true}
  ];

  select(text: string) { this.selected = text; }
}
