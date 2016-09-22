import {Component} from '@angular/core';
import {MdUniqueSelectionDispatcher} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html',
  providers: [MdUniqueSelectionDispatcher],
})
export class ButtonToggleDemo {
  favoritePie = 'Apple';
  pieOptions = [
    'Apple',
    'Cherry',
    'Pecan',
    'Lemon',
  ];
}
