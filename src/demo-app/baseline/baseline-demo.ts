import {Component} from '@angular/core';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input/input';
import {MD_BUTTON_DIRECTIVES} from '@angular2-material/button/button';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card/card';
import {MD_CHECKBOX_DIRECTIVES} from '@angular2-material/checkbox/checkbox';
import {MD_RADIO_DIRECTIVES} from '@angular2-material/radio/radio';
import {MdIcon} from '@angular2-material/icon/icon';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';

import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


@Component({
  moduleId: module.id,
  selector: 'baseline-demo',
  templateUrl: 'baseline-demo.html',
  styleUrls: ['baseline-demo.css'],
  providers: [MdUniqueSelectionDispatcher],
  directives: [
    MD_BUTTON_DIRECTIVES,
    MD_CARD_DIRECTIVES,
    MD_CHECKBOX_DIRECTIVES,
    MD_RADIO_DIRECTIVES,
    MD_INPUT_DIRECTIVES,
    MdIcon,
    MdToolbar
  ]
})
export class BaselineDemo {
  name: string;
}
