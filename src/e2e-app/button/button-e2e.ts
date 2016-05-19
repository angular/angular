import {Component} from '@angular/core';
import {MdButton, MdAnchor} from '@angular2-material/button/button';
import {MdIcon} from '@angular2-material/icon/icon';

@Component({
  moduleId: module.id,
  selector: 'button-e2e',
  templateUrl: 'button-e2e.html',
  directives: [MdButton, MdAnchor, MdIcon]
})
export class ButtonE2E {
  isDisabled: boolean = false;
  clickCounter: number = 0;
}
