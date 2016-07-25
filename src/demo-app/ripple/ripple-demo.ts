import {
  Component,
  ViewChild,
} from '@angular/core';
import {MD_BUTTON_DIRECTIVES} from '@angular2-material/button/button';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card/card';
import {MD_CHECKBOX_DIRECTIVES} from '@angular2-material/checkbox/checkbox';
import {MD_ICON_DIRECTIVES} from '@angular2-material/icon/icon';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input/input';
import {MD_RADIO_DIRECTIVES} from '@angular2-material/radio/radio';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';
import {MD_RIPPLE_DIRECTIVES, MdRipple} from '@angular2-material/core/core';

@Component({
  moduleId: module.id,
  selector: 'ripple-demo',
  templateUrl: 'ripple-demo.html',
  styleUrls: ['ripple-demo.css'],
  providers: [MdUniqueSelectionDispatcher],
  directives: [
    MD_BUTTON_DIRECTIVES,
    MD_CARD_DIRECTIVES,
    MD_CHECKBOX_DIRECTIVES,
    MD_ICON_DIRECTIVES,
    MD_INPUT_DIRECTIVES,
    MD_RADIO_DIRECTIVES,
    MD_RIPPLE_DIRECTIVES,
  ],
})
export class RippleDemo {
  @ViewChild(MdRipple) manualRipple: MdRipple;

  centered = false;
  disabled = false;
  unbounded = false;
  rounded = false;
  maxRadius: number = null;
  rippleSpeed = 1;
  rippleColor = '';
  rippleBackgroundColor = '';

  doManualRipple() {
    if (this.manualRipple) {
      window.setTimeout(() => this.manualRipple.start(), 10);
      window.setTimeout(() => this.manualRipple.end(0, 0), 500);
    }
  }
}
