import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Optional,
  Output,
  Provider,
  QueryList,
  ViewEncapsulation,
  forwardRef
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from '@angular/common';
import {MdRadioDispatcher} from './radio_dispatcher';


export {MdRadioDispatcher} from './radio_dispatcher';



/**
 * Provider Expression that allows md-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 */
const MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, {
      useExisting: forwardRef(() => MdRadioGroup),
      multi: true
    });

// TODO(mtlin):
// Ink ripple is currently placeholder.
// Determine motion spec for button transitions.
// Design review.
// RTL
// Support forms API.
// Use ChangeDetectionStrategy.OnPush

var _uniqueIdCounter = 0;

/** A simple change event emitted by either MdRadioButton or MdRadioGroup. */
export class MdRadioChange {
  source: MdRadioButton;
  value: any;
}

@Directive({
  selector: 'md-radio-group',
  providers: [MD_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
  host: {
    'role': 'radiogroup',
  },
})
export class MdRadioGroup implements AfterContentInit, ControlValueAccessor {
  /** The value for the radio group. Should match currently selected button. */
  private _value: any = null;

  /** The HTML name attribute applied to radio buttons in this group. */
  private _name: string = null;

  /** Disables all individual radio buttons assigned to this group. */
  private _disabled: boolean = false;

  /** The currently selected radio button. Should match value. */
  private _selected: MdRadioButton = null;

  /** Change event subscription set up by registerOnChange (ControlValueAccessor). */
  private _changeSubscription: {unsubscribe: () => any} = null;

  onTouched: () => any = () => {};

  /** Event emitted when the group value changes. */
  @Output()
  change: EventEmitter<MdRadioChange> = new EventEmitter<MdRadioChange>();

  /** Child radio buttons. */
  @ContentChildren(forwardRef(() => MdRadioButton))
  private _radios: QueryList<MdRadioButton> = null;

  /**
   * Initialize properties once content children are available.
   * This allows us to propagate relevant attributes to associated buttons.
   */
  ngAfterContentInit() {
    if (this._name == null) {
      this.name = `md-radio-group-${_uniqueIdCounter++}`;
    } else {
      this._updateChildRadioNames();
    }
  }

  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;

    this._updateChildRadioNames();
  }

  /** Propagate name attribute to radio buttons. */
  private _updateChildRadioNames(): void {
    if (this._radios != null) {
      this._radios.forEach((radio) => {
        radio.name = this._name;
      });
    }
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this._disabled = (value != null && value !== false) ? true : null;
  }

  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (this._value != newValue) {
      // Set this before proceeding to ensure no circular loop occurs with selection.
      this._value = newValue;

      this._updateSelectedRadioFromValue();
      this._emitChangeEvent();
    }
  }

  private _updateSelectedRadioFromValue(): void {
    // Update selected if different from current value.
    let isAlreadySelected = this._selected != null && this._selected.value == this._value;
    if (this._radios != null && !isAlreadySelected) {
      let matched = this._radios.filter((radio) => {
        return radio.value == this._value;
      });

      if (matched.length == 0) {
        // When the value of the group is cleared to null, deselect all radio button in the group.
        if (this.value == null) {
          this.selected = null;
          this._radios.forEach(radio => radio.checked = false);
        }
      } else {
        this.selected = matched[0];
      }
    }
  }

  /** Dispatch change event with current selection and group value. */
  private _emitChangeEvent(): void {
    let event = new MdRadioChange();
    event.source = this._selected;
    event.value = this._value;
    this.change.emit(event);
  }

  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected: MdRadioButton) {
    if (selected) {
      this._selected = selected;
      this.value = selected.value;

      selected.checked = true;
    } else {
      this._selected = null;
      this._value = null;
    }
  }

   /** Implemented as part of ControlValueAccessor. */
  writeValue(value: any) {
    this.value = value;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: any) {
    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
    }
    this._changeSubscription = <{unsubscribe: () => any}>this.change.subscribe(
      (changeEvent: MdRadioChange) => { fn(changeEvent.value); });
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
}


@Component({
  selector: 'md-radio-button',
  templateUrl: './components/radio/radio.html',
  styleUrls: ['./components/radio/radio.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(click)': 'onClick($event)'
  }
})
export class MdRadioButton implements OnInit {
  @HostBinding('class.md-radio-focused')
  private _isFocused: boolean;

  /** Whether this radio is checked. */
  private _checked: boolean = false;

  /** The unique ID for the radio button. */
  @HostBinding('id')
  @Input()
  id: string;

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  @Input()
  name: string;

  /** Whether this radio is disabled. */
  private _disabled: boolean;

  /** Value assigned to this radio.*/
  private _value: any = null;

  /** The parent radio group. May or may not be present. */
  radioGroup: MdRadioGroup;

  /** Event emitted when the group value changes. */
  @Output()
  change: EventEmitter<MdRadioChange> = new EventEmitter<MdRadioChange>();

  constructor(@Optional() radioGroup: MdRadioGroup, public radioDispatcher: MdRadioDispatcher) {
    // Assertions. Ideally these should be stripped out by the compiler.
    // TODO(jelbourn): Assert that there's no name binding AND a parent radio group.

    this.radioGroup = radioGroup;

    radioDispatcher.listen((name: string) => {
      if (name == this.name) {
        this.checked = false;
      }
    });
  }

  ngOnInit() {
    if (this.id == null) {
      this.id = `md-radio-${_uniqueIdCounter++}`;
    }

    if (this.radioGroup && this._value == this.radioGroup.value) {
      this._checked = true;
    }
  }

  /*
   * We use a hidden native input field to handle changes to focus state via keyboard navigation,
   * with visual rendering done separately. The native element is kept in sync with the overall
   * state of the component.
   */
  onInputFocus() {
    this._isFocused = true;
  }

  onInputBlur() {
    this._isFocused = false;
  }

  /** Input change handler, called only on keyboard selection. */
  onInputChange() {
    this.checked = true;
  }

  get inputId(): string {
    return `${this.id}-input`;
  }

  @HostBinding('class.md-radio-checked')
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    if (value) {
      // Notify all radio buttons with the same name to un-check.
      this.radioDispatcher.notify(this.name);

      if (!this._checked) {
        this._emitChangeEvent();
      }
    }
    this._checked = value;
  }

  /** MdRadioGroup reads this to assign its own value. */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value != value) {
      if (this.radioGroup != null && this.checked) {
        this.radioGroup.value = value;
      }
      this._value = value;
    }
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    let event = new MdRadioChange();
    event.source = this;
    event.value = this._value;
    this.change.emit(event);
  }

  @HostBinding('class.md-radio-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.radioGroup != null && this.radioGroup.disabled);
  }

  set disabled(value: boolean) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this._disabled = (value != null && value !== false) ? true : null;
  }

  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.radioGroup != null) {
      // Propagate the change one-way via the group, which will in turn mark this
      // button as checked.
      this.radioGroup.selected = this;
    } else {
      this.checked = true;
    }
  }
}
