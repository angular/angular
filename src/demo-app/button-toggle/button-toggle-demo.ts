import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html'
})
export class ButtonToggleDemo {
  isVertical = false;
  isDisabled = false;
  favoritePie = 'Apple';
  pieOptions = [
    'Apple',
    'Cherry',
    'Pecan',
    'Lemon',
  ];
}
