import {Component, BaseView, ViewEncapsulation, Attribute} from 'angular2/angular2';
import {MdCheckbox} from "../checkbox/checkbox";

// TODO(jelbourn): add gesture support
// TODO(jelbourn): clean up CSS.

@Component({
  selector: 'md-switch',
  properties: ['checked', 'disabled'],
  host: {
    'role': 'checkbox',
    '[attr.aria-checked]': 'checked',
    '[attr.aria-disabled]': 'disabled_',
    '(keydown)': 'onKeydown($event)',
  }
})
@BaseView({
  templateUrl: 'package:angular2_material/src/components/switcher/switch.html',
  directives: [],
  encapsulation: ViewEncapsulation.NONE
})
export class MdSwitch extends MdCheckbox {
  constructor(@Attribute('tabindex') tabindex: string) {
    super(tabindex);
  }
}
