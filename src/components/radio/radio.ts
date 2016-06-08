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
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


// Re-exports.
export {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';



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
  /**
   * Selected value for group. Should equal the value of the selected radio button if there *is*
   * a corresponding radio button with a matching value. If there is *not* such a corresponding
   * radio button, this value persists to be applied in case a new radio button is added with a
   * matching value.
   */
  private _value: any = null;

  /** The HTML name attribute applied to radio buttons in this group. */
  private _name: string = `md-radio-group-${_uniqueIdCounter++}`;

  /** Disables all individual radio buttons assigned to this group. */
  private _disabled: boolean = false;

  /** The currently selected radio button. Should match value. */
  private _selected: MdRadioButton = null;

  /** Whether the `value` has been set to its initial value. */
  private _isInitialized: boolean = false;

  /** The method to be called in order to update ngModel */
  private _controlValueAccessorChangeFn: (value: any) => void = (value) => {};

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  onTouched: () => any = () => {};

  /** Event emitted when the group value changes. */
  @Output()
  change: EventEmitter<MdRadioChange> = new EventEmitter<MdRadioChange>();

  /** Child radio buttons. */
  @ContentChildren(forwardRef(() => MdRadioButton))
  private _radios: QueryList<MdRadioButton> = null;

  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this._updateRadioButtonNames();
  }

  @Input() align: 'start' | 'end';

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

      // Only fire a change event if this isn't the first time the value is ever set.
      if (this._isInitialized) {
        this._emitChangeEvent();
      }
    }
  }

  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected: MdRadioButton) {
    this._selected = selected;
    this.value = selected ? selected.value : null;

    if (selected && !selected.checked) {
      selected.checked = true;
    }
  }

  /**
   * Initialize properties once content children are available.
   * This allows us to propagate relevant attributes to associated buttons.
   * TODO: internal
   */
  ngAfterContentInit() {
    // Mark this component as initialized in AfterContentInit because the initial value can
    // possibly be set by NgModel on MdRadioGroup, and it is possible that the OnInit of the
    // NgModel occurs *after* the OnInit of the MdRadioGroup.
    this._isInitialized = true;
  }

  /**
   * Mark this group as being "touched" (for ngModel). Meant to be called by the contained
   * radio buttons upon their blur.
   * @internal
   */
  touch() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private _updateRadioButtonNames(): void {
    (this._radios || []).forEach(radio => {
      radio.name = this.name;
    });
  }

  /** Updates the `selected` radio button from the internal _value state. */
  private _updateSelectedRadioFromValue(): void {
    // If the value already matches the selected radio, do nothing.
    let isAlreadySelected = this._selected != null && this._selected.value == this._value;

    if (this._radios != null && !isAlreadySelected) {
      let matchingRadio = this._radios.filter(radio => radio.value == this._value)[0];

      if (matchingRadio) {
        this.selected = matchingRadio;
      } else if (this.value == null) {
        this.selected = null;
        this._radios.forEach(radio => { radio.checked = false; });
      }
    }
  }

  /** Dispatch change event with current selection and group value. */
  private _emitChangeEvent(): void {
    let event = new MdRadioChange();
    event.source = this._selected;
    event.value = this._value;
    this._controlValueAccessorChangeFn(event.value);
    this.change.emit(event);
  }

  /**
    * Implemented as part of ControlValueAccessor.
    * TODO: internal
    */
  writeValue(value: any) {
    this.value = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
}


@Component({
  moduleId: module.id,
  selector: 'md-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
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
  id: string = `md-radio-${_uniqueIdCounter++}`;

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  @Input()
  name: string;

  /** Used to set the 'aria-label' attribute on the underlying input element. */
  @Input('aria-label') ariaLabel: string;

  /** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Whether this radio is disabled. */
  private _disabled: boolean;

  /** Value assigned to this radio.*/
  private _value: any = null;

  /** The parent radio group. May or may not be present. */
  radioGroup: MdRadioGroup;

  /** Event emitted when the group value changes. */
  @Output()
  change: EventEmitter<MdRadioChange> = new EventEmitter<MdRadioChange>();

  constructor(@Optional() radioGroup: MdRadioGroup,
              public radioDispatcher: MdUniqueSelectionDispatcher) {
    // Assertions. Ideally these should be stripped out by the compiler.
    // TODO(jelbourn): Assert that there's no name binding AND a parent radio group.

    this.radioGroup = radioGroup;

    radioDispatcher.listen((id: string, name: string) => {
      if (id != this.id && name == this.name) {
        this.checked = false;
      }
    });
  }

  get inputId(): string {
    return `${this.id}-input`;
  }

  @HostBinding('class.md-radio-checked')
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(newCheckedState: boolean) {
    if (newCheckedState) {
      // Notify all radio buttons with the same name to un-check.
      this.radioDispatcher.notify(this.id, this.name);
    }

    if (newCheckedState != this._checked) {
      this._emitChangeEvent();
    }

    this._checked = newCheckedState;

    if (newCheckedState && this.radioGroup && this.radioGroup.value != this.value) {
      this.radioGroup.selected = this;
    }
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

  private _align: 'start' | 'end';

  @Input()
  get align(): 'start' | 'end' {
    return this._align || (this.radioGroup != null && this.radioGroup.align) || 'start';
  }

  set align(value: 'start' | 'end') {
    this._align = value;
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

  /** TODO: internal */
  ngOnInit() {
    if (this.radioGroup) {
      // If the radio is inside a radio group, determine if it should be checked
      this.checked = this.radioGroup.value === this._value;
      // Copy name from parent radio group
      this.name = this.radioGroup.name;
    }
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    let event = new MdRadioChange();
    event.source = this;
    event.value = this._value;
    this.change.emit(event);
  }

  /** @internal */
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
      this.radioGroup.touch();
    } else {
      this.checked = true;
    }
  }

  /**
   * We use a hidden native input field to handle changes to focus state via keyboard navigation,
   * with visual rendering done separately. The native element is kept in sync with the overall
   * state of the component.
   * @internal
   */
  onInputFocus() {
    this._isFocused = true;
  }

  /** @internal */
  onInputBlur() {
    this._isFocused = false;
    if (this.radioGroup) {
      this.radioGroup.touch();
    }
  }

  /**
   * Checks the radio due to an interaction with the underlying native <input type="radio">
   * @internal
   */
  onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    this.checked = true;
    if (this.radioGroup) {
      this.radioGroup.touch();
    }
  }
}

export const MD_RADIO_DIRECTIVES = [MdRadioGroup, MdRadioButton];
