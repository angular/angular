import {Component} from '@angular/core';
import {MD_MENU_DIRECTIVES} from '@angular2-material/menu/menu';

@Component({
  moduleId: module.id,
  selector: 'menu-demo',
  templateUrl: 'menu-demo.html',
  styleUrls: ['menu-demo.css'],
  directives: [MD_MENU_DIRECTIVES]
})
export class MenuDemo {}
