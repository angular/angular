import {Component} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';
import {Attribute} from 'angular2/src/core/annotations_impl/di';
import {isPresent} from 'angular2/src/facade/lang';
import {KEY_SPACE} from 'angular2_material/src/core/constants'
import {KeyboardEvent} from 'angular2/src/facade/browser';
import {NumberWrapper} from 'angular2/src/facade/lang';

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
    'disabled': 'attr.aria-disabled'
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
  _disabled: boolean;

  /** Setter for `role` attribute. */
  role: string;

  /** Setter for tabindex */
  tabindex: number;

  constructor(@Attribute('tabindex') tabindex: String) {
    this.role = 'checkbox';
    this.checked = false;
    this.tabindex = isPresent(tabindex) ? NumberWrapper.parseInt(tabindex, 10) : 0;
    this._disabled = false;
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = isPresent(value) && value !== false;
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
