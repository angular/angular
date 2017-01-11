import {Component} from '@angular/core';
import {UniqueSelectionDispatcher} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html',
  providers: [UniqueSelectionDispatcher],
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
