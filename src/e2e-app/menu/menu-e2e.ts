import {Component} from '@angular/core';
import {MD_MENU_DIRECTIVES} from '@angular2-material/menu/menu';

@Component({
  moduleId: module.id,
  selector: 'menu-e2e',
  templateUrl: 'menu-e2e.html',
  directives: [MD_MENU_DIRECTIVES],
  styles: [`
    #before-t, #above-t, #combined-t {
      width: 60px;
      height: 20px;
    }

    .bottom-row {
      position: absolute;
      top: 100px;
    }
  `]
})
export class MenuE2E {
  selected: string = '';
}
