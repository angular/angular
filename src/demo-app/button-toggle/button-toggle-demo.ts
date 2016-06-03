import {Component} from '@angular/core';
import {MD_BUTTON_TOGGLE_DIRECTIVES} from '@angular2-material/button-toggle/button-toggle';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';
import {MdIcon} from '@angular2-material/icon/icon';

@Component({
  moduleId: module.id,
  selector: 'button-toggle-demo',
  templateUrl: 'button-toggle-demo.html',
  providers: [MdUniqueSelectionDispatcher],
  directives: [MD_BUTTON_TOGGLE_DIRECTIVES, MdIcon]
})
export class ButtonToggleDemo { }
