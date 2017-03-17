import {
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Renderer,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  AfterViewInit,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {UniqueSelectionDispatcher, coerceBooleanProperty, FocusOriginMonitor} from '../core';

/** Acceptable types for a button toggle. */
export type ToggleType = 'checkbox' | 'radio';



/**
 * Provider Expression that allows md-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdButtonToggleGroup),
  multi: true
};

let _uniqueIdCounter = 0;

/** Change event object emitted by MdButtonToggle. */
export class MdButtonToggleChange {
  /** The MdButtonToggle that emits the event. */
  source: MdButtonToggle;
  /** The value assigned to the MdButtonToggle. */
  value: any;
}

/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
  selector: 'md-button-toggle-group:not([multiple]), mat-button-toggle-group:not([multiple])',
  providers: [MD_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR],
  host: {
    '[class.mat-button-toggle-group]': 'true',
    'role': 'radiogroup',
    '[class.mat-button-toggle-vertical]': 'vertical'
  },
  exportAs: 'mdButtonToggleGroup',
})
export class MdButtonToggleGroup implements AfterViewInit, ControlValueAccessor {
  /** The value for the button toggle group. Should match currently selected button toggle. */
  private _value: any = null;

  /** The HTML name attribute applied to toggles in this group. */
  private _name: string = `md-button-toggle-group-${_uniqueIdCounter++}`;

  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** Whether the button toggle group should be vertical. */
  private _vertical: boolean = false;

  /** The currently selected button toggle, should match the value. */
  private _selected: MdButtonToggle = null;

  /** Whether the button toggle group is initialized or not. */
  private _isInitialized: boolean = false;

  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  private _controlValueAccessorChangeFn: (value: any) => void = (value) => {};

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  onTouched: () => any = () => {};

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => MdButtonToggle))
  _buttonToggles: QueryList<MdButtonToggle> = null;

  ngAfterViewInit() {
    this._isInitialized = true;
  }

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this._updateButtonToggleNames();
  }

  /** Whether the toggle group is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Whether the toggle group is vertical. */
  @Input()
  get vertical(): boolean {
    return this._vertical;
  }

  set vertical(value) {
    this._vertical = coerceBooleanProperty(value);
  }

  /** Value of the toggle group. */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (this._value != newValue) {
      this._value = newValue;

      this._updateSelectedButtonToggleFromValue();

      // Only emit a change event if the view is completely initialized.
      // We don't want to emit a change event for the initial values.
      if (this._isInitialized) {
        this._emitChangeEvent();
      }
    }
  }

  /** Whether the toggle group is selected. */
  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected: MdButtonToggle) {
    this._selected = selected;
    this.value = selected ? selected.value : null;

    if (selected && !selected.checked) {
      selected.checked = true;
    }
  }

  /** Event emitted when the group's value changes. */
  @Output() get change(): Observable<MdButtonToggleChange> {
    return this._change.asObservable();
  }
  private _change: EventEmitter<MdButtonToggleChange> = new EventEmitter<MdButtonToggleChange>();

  private _updateButtonToggleNames(): void {
    if (this._buttonToggles) {
      this._buttonToggles.forEach((toggle) => {
        toggle.name = this._name;
      });
    }
  }

  // TODO: Refactor into shared code with radio.
  private _updateSelectedButtonToggleFromValue(): void {
    let isAlreadySelected = this._selected != null && this._selected.value == this._value;

    if (this._buttonToggles != null && !isAlreadySelected) {
      let matchingButtonToggle = this._buttonToggles.filter(
          buttonToggle => buttonToggle.value == this._value)[0];

      if (matchingButtonToggle) {
        this.selected = matchingButtonToggle;
      } else if (this.value == null) {
        this.selected = null;
        this._buttonToggles.forEach(buttonToggle => {
          buttonToggle.checked = false;
        });
      }
    }
  }

  /** Dispatch change event with current selection and group value. */
  private _emitChangeEvent(): void {
    let event = new MdButtonToggleChange();
    event.source = this._selected;
    event.value = this._value;
    this._controlValueAccessorChangeFn(event.value);
    this._change.emit(event);
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.value = value;
  }

  /**
   * Registers a callback that will be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn On change callback function.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback that will be triggered when the control has been touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn On touch callback function.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Toggles the disabled state of the component. Implemented as part of ControlValueAccessor.
   * @param isDisabled Whether the component should be disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

/** Multiple selection button-toggle group. `ngModel` is not supported in this mode. */
@Directive({
  selector: 'md-button-toggle-group[multiple], mat-button-toggle-group[multiple]',
  exportAs: 'mdButtonToggleGroup',
  host: {
    '[class.mat-button-toggle-group]': 'true',
    '[class.mat-button-toggle-vertical]': 'vertical'
  }
})
export class MdButtonToggleGroupMultiple {
  /** Disables all toggles in the group. */
  private _disabled: boolean = null;

  /** Whether the button toggle group should be vertical. */
  private _vertical: boolean = false;

  /** Whether the toggle group is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = (value != null && value !== false) ? true : null;
  }

  /** Whether the toggle group is vertical. */
  @Input()
  get vertical(): boolean {
    return this._vertical;
  }

  set vertical(value) {
    this._vertical = coerceBooleanProperty(value);
  }
}

/** Single button inside of a toggle group. */
@Component({
  moduleId: module.id,
  selector: 'md-button-toggle, mat-button-toggle',
  templateUrl: 'button-toggle.html',
  styleUrls: ['button-toggle.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.mat-button-toggle]': 'true'
  }
})
export class MdButtonToggle implements OnInit {
  /** Whether or not this button toggle is checked. */
  private _checked: boolean = false;

  /** Type of the button toggle. Either 'radio' or 'checkbox'. */
  _type: ToggleType;

  /** Whether or not this button toggle is disabled. */
  private _disabled: boolean = null;

  /** Value assigned to this button toggle. */
  private _value: any = null;

  /** Whether or not the button toggle is a single selection. */
  private _isSingleSelector: boolean = null;

  @ViewChild('input') _inputElement: ElementRef;

  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup: MdButtonToggleGroup;

  /** The parent button toggle group (multiple selection). Optional. */
  buttonToggleGroupMultiple: MdButtonToggleGroupMultiple;

  /** Unique ID for the underlying `input` element. */
  get inputId(): string {
    return `${this.id}-input`;
  }

  /** The unique ID for this button toggle. */
  @HostBinding()
  @Input()
  id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input()
  name: string;

  /** Whether the button is checked. */
  @HostBinding('class.mat-button-toggle-checked')
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(newCheckedState: boolean) {
    if (this._isSingleSelector) {
      if (newCheckedState) {
        // Notify all button toggles with the same name (in the same group) to un-check.
        this._buttonToggleDispatcher.notify(this.id, this.name);
      }
    }

    this._checked = newCheckedState;

    if (newCheckedState && this._isSingleSelector && this.buttonToggleGroup.value != this.value) {
      this.buttonToggleGroup.selected = this;
    }
  }

  /** MdButtonToggleGroup reads this to assign its own value. */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value != value) {
      if (this.buttonToggleGroup != null && this.checked) {
        this.buttonToggleGroup.value = value;
      }
      this._value = value;
    }
  }

  /** Whether the button is disabled. */
  @HostBinding('class.mat-button-toggle-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.buttonToggleGroup != null && this.buttonToggleGroup.disabled) ||
        (this.buttonToggleGroupMultiple != null && this.buttonToggleGroupMultiple.disabled);
  }

  set disabled(value: boolean) {
    this._disabled = (value != null && value !== false) ? true : null;
  }

  /** Event emitted when the group value changes. */
  private _change: EventEmitter<MdButtonToggleChange> = new EventEmitter<MdButtonToggleChange>();
  @Output() get change(): Observable<MdButtonToggleChange> {
    return this._change.asObservable();
  }

  constructor(@Optional() toggleGroup: MdButtonToggleGroup,
              @Optional() toggleGroupMultiple: MdButtonToggleGroupMultiple,
              private _buttonToggleDispatcher: UniqueSelectionDispatcher,
              private _renderer: Renderer,
              private _elementRef: ElementRef,
              private _focusOriginMonitor: FocusOriginMonitor) {
    this.buttonToggleGroup = toggleGroup;

    this.buttonToggleGroupMultiple = toggleGroupMultiple;

    if (this.buttonToggleGroup) {
      _buttonToggleDispatcher.listen((id: string, name: string) => {
        if (id != this.id && name == this.name) {
          this.checked = false;
        }
      });

      this._type = 'radio';
      this.name = this.buttonToggleGroup.name;
      this._isSingleSelector = true;
    } else {
      // Even if there is no group at all, treat the button toggle as a checkbox so it can be
      // toggled on or off.
      this._type = 'checkbox';
      this._isSingleSelector = false;
    }
  }

  ngOnInit() {
    if (this.id == null) {
      this.id = `md-button-toggle-${_uniqueIdCounter++}`;
    }

    if (this.buttonToggleGroup && this._value == this.buttonToggleGroup.value) {
      this._checked = true;
    }
    this._focusOriginMonitor.monitor(this._elementRef.nativeElement, this._renderer, true);
  }

  /** Focuses the button. */
  focus() {
    this._renderer.invokeElementMethod(this._inputElement.nativeElement, 'focus');
  }

  /** Toggle the state of the current button toggle. */
  private _toggle(): void {
    this.checked = !this.checked;
  }

  /** Checks the button toggle due to an interaction with the underlying native input. */
  _onInputChange(event: Event) {
    event.stopPropagation();

    if (this._isSingleSelector) {
      // Propagate the change one-way via the group, which will in turn mark this
      // button toggle as checked.
      this.checked = true;
      this.buttonToggleGroup.selected = this;
      this.buttonToggleGroup.onTouched();
    } else {
      this._toggle();
    }

    // Emit a change event when the native input does.
    this._emitChangeEvent();
  }

  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `slide-toggle` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  }

  /** Dispatch change event with current value. */
  private _emitChangeEvent(): void {
    let event = new MdButtonToggleChange();
    event.source = this;
    event.value = this._value;
    this._change.emit(event);
  }
}
