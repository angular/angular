import {Component} from '@angular/core';
import {MdButton, MdAnchor} from '@angular2-material/button/button';
import {MdIcon} from '@angular2-material/icon/icon';

@Component({
  moduleId: module.id,
  selector: 'button-demo',
  templateUrl: 'button-demo.html',
  styleUrls: ['button-demo.css'],
  directives: [MdButton, MdAnchor, MdIcon]
})
export class ButtonDemo {
  isDisabled: boolean = false;
  clickCounter: number = 0;
}
