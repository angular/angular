import {Component} from '@angular/core';
import {MdButton, MdAnchor} from '../../components/button/button';
import {MdIcon} from '../../components/icon/icon';

@Component({
    selector: 'button-demo',
    templateUrl: 'demo-app/button/button-demo.html',
    styleUrls: ['demo-app/button/button-demo.css'],
    directives: [MdButton, MdAnchor, MdIcon]
})
export class ButtonDemo {
  isDisabled: boolean = false;
  clickCounter: number = 0;
}
