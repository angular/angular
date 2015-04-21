import {Component, View, Attribute} from 'angular2/angular2';
import {isPresent} from 'angular2/src/facade/lang';
import {KEY_SPACE} from 'angular2_material/src/core/constants'
import {KeyboardEvent} from 'angular2/src/facade/browser';

// TODO(jelbourn): without gesture support, this is identical to MdCheckbox.

@Component({
  selector: 'md-switch',
  properties: {
    'checked': 'checked',
    'disabled': 'disabled'
  },
  hostListeners: {
    'keydown': 'onKeydown($event)'
  },
  hostProperties: {
    'checked': 'attr.aria-checked',
    'disabled_': 'attr.aria-disabled',
    'role': 'attr.role'
  }
})
@View({
  templateUrl: 'angular2_material/src/components/switcher/switch.html',
  directives: []
})
export class MdSwitch {
  /** Whether this switch is checked. */
  checked: boolean;

  /** Whether this switch is disabled. */
  disabled_: boolean;

  tabindex:any;
  role:any;

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
    if (event.keyCode === KEY_SPACE) {
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

