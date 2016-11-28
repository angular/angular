import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'menu-e2e',
  templateUrl: 'menu-e2e.html',
  styles: [`
    #before-t, #above-t, #combined-t {
      width: 60px;
      height: 20px;
    }

    .bottom-row {
      margin-top: 5px;
    }
  `]
})
export class MenuE2E {
  selected: string = '';
}
