import {Component} from '@angular/core';
import {MD_INPUT_DIRECTIVES} from '../../components/input/input';
import {MdButton} from '../../components/button/button';
import {MdCard} from '../../components/card/card';
import {MdCheckbox} from '../../components/checkbox/checkbox';
import {MdIcon} from '../../components/icon/icon';
import {MdToolbar} from '../../components/toolbar/toolbar';


let max = 5;

@Component({
  selector: 'input-demo',
  templateUrl: 'demo-app/input/input-demo.html',
  styleUrls: ['demo-app/input/input-demo.css'],
  directives: [MdCard, MdCheckbox, MdButton, MdIcon, MdToolbar, MD_INPUT_DIRECTIVES]
})
export class InputDemo {
  dividerColor: boolean;
  requiredField: boolean;
  floatingLabel: boolean;
  name: string;
  items: any[] = [
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 40 },
    { value: 50 },
  ];

  addABunch(n: number) {
    for (let x = 0; x < n; x++) {
      this.items.push({ value: ++max });
    }
  }
}
