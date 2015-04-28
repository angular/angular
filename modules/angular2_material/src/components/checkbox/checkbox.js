import {Component, View, Attribute} from 'angular2/angular2';
import {isPresent} from 'angular2/src/facade/lang';
import {KEY_SPACE} from 'angular2_material/src/core/constants'
import {KeyboardEvent} from 'angular2/src/facade/browser';

@Component({
  selector: 'md-checkbox',
  properties: {
    'checked': 'checked',
    'disabled': 'disabled'
  },
  hostListeners: {
    'keydown': 'onKeydown($event)'
  },
  hostProperties: {
    'tabindex': 'tabindex',
    'role': 'attr.role',
    'checked': 'attr.aria-checked',
    'disabled_': 'attr.aria-disabled'
  }
})
@View({
  templateUrl: 'angular2_material/src/components/checkbox/checkbox.html',
  directives: []
})
export class MdCheckbox {
  /** Whether this checkbox is checked. */
  checked: boolean;

  /** Whether this checkbox is disabled. */
  disabled_: boolean;

  /** Setter for `role` attribute. */
  role: string;

  /** Setter for tabindex */
  tabindex: any;

  constructor(@Attribute('tabindex') tabindex: string) {
    this.role = 'checkbox';
    this.checked = false;
    this.tabindex = isPresent(tabindex) ? tabindex : '0';
  }

  get disabled() {
    return this.disabled_;
  }

  set disabled(value) {
    this.disabled_ = isPresent(value) && value !== false;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.keyCode == KEY_SPACE) {
      event.preventDefault();
      this.toggle(event);
    }
  }

  toggle(event) {
    if (this.disabled) {
      event.stopPropagation();
      return;
    }

    this.checked = !this.checked;
  }
}
