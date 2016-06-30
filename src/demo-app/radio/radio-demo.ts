import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {FORM_DIRECTIVES} from '@angular/forms';
import {MdCheckbox} from '@angular2-material/checkbox/checkbox';
import {MD_RADIO_DIRECTIVES} from '@angular2-material/radio/radio';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';

@Component({
  moduleId: module.id,
  selector: 'radio-demo',
  templateUrl: 'radio-demo.html',
  styleUrls: ['radio-demo.css'],
  providers: [MdUniqueSelectionDispatcher],
  directives: [MdCheckbox, MD_RADIO_DIRECTIVES, FORM_DIRECTIVES, NgFor]
})
export class RadioDemo {
  isDisabled: boolean = false;
  isAlignEnd: boolean = false;
  favoriteSeason: string = 'Autumn';
  seasonOptions = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}
