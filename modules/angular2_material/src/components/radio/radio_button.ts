import {Component, View, onChange, Parent, Ancestor, Attribute, Optional} from 'angular2/angular2';

import {isPresent, StringWrapper, NumberWrapper} from 'angular2/src/facade/lang';
import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Event, KeyboardEvent} from 'angular2/src/facade/browser';

import {MdRadioDispatcher} from 'angular2_material/src/components/radio/radio_dispatcher';
import {KEY_UP, KEY_DOWN, KEY_SPACE} from 'angular2_material/src/core/constants';

// TODO(jelbourn): Behaviors to test
// Disabled radio don't select
// Disabled radios don't propagate click event
// Radios are disabled by parent group
// Radios set default tab index iff not in parent group
// Radios are unique-select
// Radio updates parent group's value
// Change to parent group's value updates the selected child radio
// Radio name is pulled on parent group
// Radio group changes on arrow keys
// Radio group skips disabled radios on arrow keys

var _uniqueIdCounter: number = 0;

@Component({
  selector: 'md-radio-group',
  lifecycle: [onChange],
  events: ['change'],
  properties: ['disabled', 'value'],
  host: {
    // TODO(jelbourn): Remove ^ when event retargeting is fixed.
    '(^keydown)': 'onKeydown($event)',
    '[tabindex]': 'tabindex',
    '[attr.role]': '"radiogroup"',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-activedescendant]': 'activedescendant'
  }
})
@View({templateUrl: 'angular2_material/src/components/radio/radio_group.html'})
export class MdRadioGroup {
  /** The selected value for the radio group. The value comes from the options. */
  value: any;

  /** The HTML name attribute applied to radio buttons in this group. */
  name_: string;

  /** Dispatcher for coordinating radio unique-selection by name. */
  radioDispatcher: MdRadioDispatcher;

  /** List of child radio buttons. */
  radios_: List<MdRadioButton>;

  activedescendant: any;

  disabled_: boolean;

  /** The ID of the selected radio button. */
  selectedRadioId: string;

  change: EventEmitter;

  tabindex: number;

  constructor(@Attribute('tabindex') tabindex: string, @Attribute('disabled') disabled: string,
              radioDispatcher: MdRadioDispatcher) {
    this.name_ = `md-radio-group-${_uniqueIdCounter++}`;
    this.radios_ = [];
    this.change = new EventEmitter();
    this.radioDispatcher = radioDispatcher;
    this.selectedRadioId = '';
    this.disabled_ = false;

    // The simple presence of the `disabled` attribute dictates disabled state.
    this.disabled = isPresent(disabled);

    // If the user has not set a tabindex, default to zero (in the normal document flow).
    this.tabindex = isPresent(tabindex) ? NumberWrapper.parseInt(tabindex, 10) : 0;
  }

  /** Gets the name of this group, as to be applied in the HTML 'name' attribute. */
  getName(): string {
    return this.name_;
  }

  get disabled() {
    return this.disabled_;
  }

  set disabled(value) {
    this.disabled_ = isPresent(value) && value !== false;
  }

  /** Change handler invoked when bindings are resolved or when bindings have changed. */
  onChange(_) {
    // If the component has a disabled attribute with no value, it will set disabled = ''.
    this.disabled = isPresent(this.disabled) && this.disabled !== false;

    // If the value of this radio-group has been set or changed, we have to look through the
    // child radio buttons and select the one that has a corresponding value (if any).
    if (isPresent(this.value) && this.value != '') {
      this.radioDispatcher.notify(this.name_);
      ListWrapper.forEach(this.radios_, (radio) => {
        if (radio.value == this.value) {
          radio.checked = true;
          this.selectedRadioId = radio.id;
          this.activedescendant = radio.id;
        }
      });
    }
  }

  /** Update the value of this radio group from a child md-radio being selected. */
  updateValue(value: any, id: string) {
    this.value = value;
    this.selectedRadioId = id;
    this.activedescendant = id;
    ObservableWrapper.callNext(this.change, null);
  }

  /** Registers a child radio button with this group. */
  register(radio: MdRadioButton) {
    ListWrapper.push(this.radios_, radio);
  }

  /** Handles up and down arrow key presses to change the selected child radio. */
  onKeydown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    switch (event.keyCode) {
      case KEY_UP:
        this.stepSelectedRadio(-1);
        event.preventDefault();
        break;
      case KEY_DOWN:
        this.stepSelectedRadio(1);
        event.preventDefault();
        break;
    }
  }

  // TODO(jelbourn): Replace this with a findIndex method in the collections facade.
  getSelectedRadioIndex(): number {
    for (var i = 0; i < this.radios_.length; i++) {
      if (this.radios_[i].id == this.selectedRadioId) {
        return i;
      }
    }

    return -1;
  }

  /** Steps the selected radio based on the given step value (usually either +1 or -1). */
  stepSelectedRadio(step) {
    var index = this.getSelectedRadioIndex() + step;
    if (index < 0 || index >= this.radios_.length) {
      return;
    }

    var radio = this.radios_[index];

    // If the next radio is line is disabled, skip it (maintaining direction).
    if (radio.disabled) {
      this.stepSelectedRadio(step + (step < 0 ? -1 : 1));
      return;
    }

    this.radioDispatcher.notify(this.name_);
    radio.checked = true;
    ObservableWrapper.callNext(this.change, null);

    this.value = radio.value;
    this.selectedRadioId = radio.id;
    this.activedescendant = radio.id;
  }
}


@Component({
  selector: 'md-radio-button',
  lifecycle: [onChange],
  properties: ['id', 'name', 'value', 'checked', 'disabled'],
  host: {
    '(keydown)': 'onKeydown($event)',
    '[id]': 'id',
    '[tabindex]': 'tabindex',
    '[attr.role]': 'role',
    '[attr.aria-checked]': 'checked',
    '[attr.aria-disabled]': 'disabled'
  }
})
@View({templateUrl: 'angular2_material/src/components/radio/radio_button.html', directives: []})
export class MdRadioButton {
  /** Whether this radio is checked. */
  checked: boolean;

  /** Whether the radio is disabled. */
  disabled_: boolean;

  /** The unique ID for the radio button. */
  id: string;

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  name: string;

  /** Value assigned to this radio. Used to assign the value to the parent MdRadioGroup. */
  value: any;

  /** The parent radio group. May or may not be present. */
  radioGroup: MdRadioGroup;

  /** Dispatcher for coordinating radio unique-selection by name. */
  radioDispatcher: MdRadioDispatcher;

  tabindex: number;

  role: string;

  constructor(@Optional() @Parent() radioGroup: MdRadioGroup, @Attribute('id') id: string,
              @Attribute('tabindex') tabindex: string, radioDispatcher: MdRadioDispatcher) {
    // Assertions. Ideally these should be stripped out by the compiler.
    // TODO(jelbourn): Assert that there's no name binding AND a parent radio group.

    this.radioGroup = radioGroup;
    this.radioDispatcher = radioDispatcher;
    this.value = null;

    this.role = 'radio';
    this.checked = false;

    this.id = isPresent(id) ? id : `md-radio-${_uniqueIdCounter++}`;

    // Whenever a radio button with the same name is checked, uncheck this radio button.
    radioDispatcher.listen((name) => {
      if (name == this.name) {
        this.checked = false;
      }
    });

    // When this radio-button is inside of a radio-group, the group determines the name.
    if (isPresent(radioGroup)) {
      this.name = radioGroup.getName();
      this.radioGroup.register(this);
    }

    // If the user has not set a tabindex, default to zero (in the normal document flow).
    if (!isPresent(radioGroup)) {
      this.tabindex = isPresent(tabindex) ? NumberWrapper.parseInt(tabindex, 10) : 0;
    } else {
      this.tabindex = -1;
    }
  }

  /** Change handler invoked when bindings are resolved or when bindings have changed. */
  onChange(_) {
    if (isPresent(this.radioGroup)) {
      this.name = this.radioGroup.getName();
    }
  }

  /** Whether this radio button is disabled, taking the parent group into account. */
  isDisabled(): boolean {
    // Here, this.disabled may be true/false as the result of a binding, may be the empty string
    // if the user just adds a `disabled` attribute with no value, or may be absent completely.
    // TODO(jelbourn): If someone sets `disabled="disabled"`, will this work in dart?
    return this.disabled || (isPresent(this.disabled) && StringWrapper.equals(this.disabled, '')) ||
           (isPresent(this.radioGroup) && this.radioGroup.disabled);
  }

  get disabled(): any {
    return this.disabled_;
  }

  set disabled(value: any) {
    this.disabled_ = isPresent(value) && value !== false;
  }

  /** Select this radio button. */
  select(event: Event) {
    if (this.isDisabled()) {
      event.stopPropagation();
      return;
    }

    // Notifiy all radio buttons with the same name to un-check.
    this.radioDispatcher.notify(this.name);

    this.checked = true;

    if (isPresent(this.radioGroup)) {
      this.radioGroup.updateValue(this.value, this.id);
    }
  }

  /** Handles pressing the space key to select this focused radio button. */
  onKeydown(event: KeyboardEvent) {
    if (event.keyCode == KEY_SPACE) {
      event.preventDefault();
      this.select(event);
    }
  }
}
