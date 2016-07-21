import {Component} from '@angular/core';
import {MD_MENU_DIRECTIVES} from '@angular2-material/menu/menu-trigger';

@Component({
  moduleId: module.id,
  selector: 'menu-e2e',
  templateUrl: 'menu-e2e.html',
  directives: [MD_MENU_DIRECTIVES]
})
export class MenuE2E {
  selected: string = '';
}
