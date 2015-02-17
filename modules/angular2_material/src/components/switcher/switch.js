import {Component, View, Attribute, PropertySetter} from 'angular2/angular2';
import {isPresent} from 'angular2/src/facade/lang';
import {KeyCodes} from 'angular2_material/src/core/constants'

// TODO(jelbourn): without gesture support, this is identical to MdCheckbox.

@Component({
  selector: 'md-switch',
  properties: {
    'checked': 'checked',
    'disabled': 'disabled'
  },
  hostListeners: {
    'keydown': 'onKeydown($event)'
  }
})
@View({
  templateUrl: 'angular2_material/src/components/switcher/switch.html',
  directives: []
})
export class MdSwitch {
  /** Whether this switch is checked. */
  checked_: boolean;

  /** Setter for `aria-checked` attribute. */
  ariaCheckedSetter: Function;

  /** Setter for `aria-disabled` attribute. */
  ariaDisabledSetter: Function;

  constructor(
      @Attribute('tabindex') tabindex: string,
      @PropertySetter('tabindex') tabindexSetter: Function,
      @PropertySetter('attr.role') roleSetter: Function,
      @PropertySetter('attr.aria-checked') ariaCheckedSetter: Function,
      @PropertySetter('attr.aria-disabled') ariaDisabledSetter: Function) {
    this.ariaCheckedSetter = ariaCheckedSetter;
    this.ariaDisabledSetter = ariaDisabledSetter;

    roleSetter('checkbox');
    this.checked = false;
    tabindexSetter(isPresent(tabindex) ? tabindex : '0');
  }

  get checked() {
    return this.checked_;
  }

  set checked(value) {
    this.checked_ = value;
    this.ariaCheckedSetter(value);
  }

  get disabled() {
    return this.disabled_;
  }

  set disabled(value) {
    this.disabled_ = isPresent(value) && value !== false;
    this.ariaDisabledSetter(this.disabled_);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.keyCode == KeyCodes.SPACE) {
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
    this.ariaCheckedSetter(this.checked);
  }
}

