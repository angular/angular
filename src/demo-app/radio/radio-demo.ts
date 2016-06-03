import {Component} from '@angular/core';
import {MdRadioButton, MdRadioGroup} from '@angular2-material/radio/radio';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';

@Component({
  moduleId: module.id,
  selector: 'radio-demo',
  templateUrl: 'radio-demo.html',
  styleUrls: ['radio-demo.css'],
  providers: [MdUniqueSelectionDispatcher],
  directives: [MdRadioButton, MdRadioGroup]
})
export class RadioDemo {
  isDisabled: boolean = false;
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}
