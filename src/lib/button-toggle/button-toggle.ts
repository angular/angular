/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Renderer2,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CanDisable, mixinDisabled} from '@angular/material/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';

/** Acceptable types for a button toggle. */
export type ToggleType = 'checkbox' | 'radio';

// Boilerplate for applying mixins to MatButtonToggleGroup and MatButtonToggleGroupMultiple
/** @docs-private */
export class MatButtonToggleGroupBase {}
export const _MatButtonToggleGroupMixinBase = mixinDisabled(MatButtonToggleGroupBase);

/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatButtonToggleGroup),
  multi: true
};

let _uniqueIdCounter = 0;

/** Change event object emitted by MatButtonToggle. */
export class MatButtonToggleChange {
  /** The MatButtonToggle that emits the event. */
  source: MatButtonToggle | null;
  /** The value assigned to the MatButtonToggle. */
  value: any;
}

/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
  selector: 'mat-button-toggle-group:not([multiple])',
  providers: [MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR],
  inputs: ['disabled'],
  host: {
    'role': 'radiogroup',
    'class': 'mat-button-toggle-group',
    '[class.mat-button-toggle-vertical]': 'vertical'
  },
  exportAs: 'matButtonToggleGroup',
})
export class MatButtonToggleGroup extends _MatButtonToggleGroupMixinBase
    implements ControlValueAccessor, CanDisable {

  /** The value for the button toggle group. Should match currently selected button toggle. */
  private _value: any = null;

  /** The HTML name attribute applied to toggles in this group. */
  private _name: string = `mat-button-toggle-group-${_uniqueIdCounter++}`;

  /** Whether the button toggle group should be vertical. */
  private _vertical: boolean = false;

  /** The currently selected button toggle, should match the value. */
  private _selected: MatButtonToggle | null = null;

  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  _controlValueAccessorChangeFn: (value: any) => void = () => {};

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  _onTouched: () => any = () => {};

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => MatButtonToggle)) _buttonToggles: QueryList<MatButtonToggle>;

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this._updateButtonToggleNames();
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
    }
  }

  /** Whether the toggle group is selected. */
  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected: MatButtonToggle | null) {
    this._selected = selected;
    this.value = selected ? selected.value : null;

    if (selected && !selected.checked) {
      selected.checked = true;
    }
  }

  /** Event emitted when the group's value changes. */
  @Output() change: EventEmitter<MatButtonToggleChange> = new EventEmitter<MatButtonToggleChange>();

  constructor(private _changeDetector: ChangeDetectorRef) {
    super();
  }

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
  _emitChangeEvent(): void {
    let event = new MatButtonToggleChange();
    event.source = this._selected;
    event.value = this._value;
    this._controlValueAccessorChangeFn(event.value);
    this.change.emit(event);
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
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
    this._onTouched = fn;
  }

  /**
   * Toggles the disabled state of the component. Implemented as part of ControlValueAccessor.
   * @param isDisabled Whether the component should be disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._markButtonTogglesForCheck();
  }

  private _markButtonTogglesForCheck() {
    if (this._buttonToggles) {
      this._buttonToggles.forEach((toggle) => toggle._markForCheck());
    }
  }
}

/** Multiple selection button-toggle group. `ngModel` is not supported in this mode. */
@Directive({
  selector: 'mat-button-toggle-group[multiple]',
  exportAs: 'matButtonToggleGroup',
  inputs: ['disabled'],
  host: {
    'class': 'mat-button-toggle-group',
    '[class.mat-button-toggle-vertical]': 'vertical',
    'role': 'group'
  }
})
export class MatButtonToggleGroupMultiple extends _MatButtonToggleGroupMixinBase
    implements CanDisable {

  /** Whether the button toggle group should be vertical. */
  private _vertical: boolean = false;

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
  selector: 'mat-button-toggle',
  templateUrl: 'button-toggle.html',
  styleUrls: ['button-toggle.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  exportAs: 'matButtonToggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.mat-button-toggle-standalone]': '!buttonToggleGroup && !buttonToggleGroupMultiple',
    '[class.mat-button-toggle-checked]': 'checked',
    '[class.mat-button-toggle-disabled]': 'disabled',
    'class': 'mat-button-toggle',
    '[attr.id]': 'id',
  }
})
export class MatButtonToggle implements OnInit, OnDestroy {
  /**
   * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string = '';

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Whether or not this button toggle is checked. */
  private _checked: boolean = false;

  /** Type of the button toggle. Either 'radio' or 'checkbox'. */
  _type: ToggleType;

  /** Whether or not this button toggle is disabled. */
  private _disabled: boolean = false;

  /** Value assigned to this button toggle. */
  private _value: any = null;

  /** Whether or not the button toggle is a single selection. */
  private _isSingleSelector: boolean = false;

  /** Unregister function for _buttonToggleDispatcher **/
  private _removeUniqueSelectionListener: () => void = () => {};

  @ViewChild('input') _inputElement: ElementRef;

  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup: MatButtonToggleGroup;

  /** The parent button toggle group (multiple selection). Optional. */
  buttonToggleGroupMultiple: MatButtonToggleGroupMultiple;

  /** Unique ID for the underlying `input` element. */
  get inputId(): string {
    return `${this.id}-input`;
  }

  /** The unique ID for this button toggle. */
  @Input() id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** Whether the button is checked. */
  @Input()
  get checked(): boolean { return this._checked; }
  set checked(newCheckedState: boolean) {
    if (this._isSingleSelector && newCheckedState) {
      // Notify all button toggles with the same name (in the same group) to un-check.
      this._buttonToggleDispatcher.notify(this.id, this.name);
      this._changeDetectorRef.markForCheck();
    }

    this._checked = newCheckedState;

    if (newCheckedState && this._isSingleSelector && this.buttonToggleGroup.value != this.value) {
      this.buttonToggleGroup.selected = this;
    }
  }

  /** MatButtonToggleGroup reads this to assign its own value. */
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
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.buttonToggleGroup != null && this.buttonToggleGroup.disabled) ||
        (this.buttonToggleGroupMultiple != null && this.buttonToggleGroupMultiple.disabled);
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Event emitted when the group value changes. */
  @Output() change: EventEmitter<MatButtonToggleChange> = new EventEmitter<MatButtonToggleChange>();

  constructor(@Optional() toggleGroup: MatButtonToggleGroup,
              @Optional() toggleGroupMultiple: MatButtonToggleGroupMultiple,
              private _changeDetectorRef: ChangeDetectorRef,
              private _buttonToggleDispatcher: UniqueSelectionDispatcher,
              private _renderer: Renderer2,
              private _elementRef: ElementRef,
              private _focusMonitor: FocusMonitor) {

    this.buttonToggleGroup = toggleGroup;
    this.buttonToggleGroupMultiple = toggleGroupMultiple;

    if (this.buttonToggleGroup) {
      this._removeUniqueSelectionListener =
        _buttonToggleDispatcher.listen((id: string, name: string) => {
          if (id != this.id && name == this.name) {
            this.checked = false;
            this._changeDetectorRef.markForCheck();
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
      this.id = `mat-button-toggle-${_uniqueIdCounter++}`;
    }

    if (this.buttonToggleGroup && this._value == this.buttonToggleGroup.value) {
      this._checked = true;
    }
    this._focusMonitor.monitor(this._elementRef.nativeElement, this._renderer, true);
  }

  /** Focuses the button. */
  focus() {
    this._inputElement.nativeElement.focus();
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
      let groupValueChanged = this.buttonToggleGroup.selected != this;
      this.checked = true;
      this.buttonToggleGroup.selected = this;
      this.buttonToggleGroup._onTouched();
      if (groupValueChanged) {
        this.buttonToggleGroup._emitChangeEvent();
      }
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
    let event = new MatButtonToggleChange();
    event.source = this;
    event.value = this._value;
    this.change.emit(event);
  }

  // Unregister buttonToggleDispatcherListener on destroy
  ngOnDestroy(): void {
    this._removeUniqueSelectionListener();
  }

  /**
   * Marks the button toggle as needing checking for change detection.
   * This method is exposed because the parent button toggle group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    // When group value changes, the button will not be notified. Use `markForCheck` to explicit
    // update button toggle's status
    this._changeDetectorRef.markForCheck();
  }
}
