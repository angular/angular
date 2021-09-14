/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {BACKSPACE, hasModifierKey, TAB} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output
} from '@angular/core';
import {MatFormField, MAT_FORM_FIELD} from '@angular/material-experimental/mdc-form-field';
import {MatChipsDefaultOptions, MAT_CHIPS_DEFAULT_OPTIONS} from './chip-default-options';
import {MatChipGrid} from './chip-grid';
import {MatChipTextControl} from './chip-text-control';

/** Represents an input event on a `matChipInput`. */
export interface MatChipInputEvent {
  /**
   * The native `<input>` element that the event is being fired for.
   * @deprecated Use `MatChipInputEvent#chipInput.inputElement` instead.
   * @breaking-change 13.0.0 This property will be removed.
   */
  input: HTMLInputElement;

  /** The value of the input. */
  value: string;

  /**
   * Reference to the chip input that emitted the event.
   * @breaking-change 13.0.0 This property will be made required.
   */
  chipInput?: MatChipInput;
}

// Increasing integer for generating unique ids.
let nextUniqueId = 0;

/**
 * Directive that adds chip-specific behaviors to an input element inside `<mat-form-field>`.
 * May be placed inside or outside of a `<mat-chip-grid>`.
 */
@Directive({
  selector: 'input[matChipInputFor]',
  exportAs: 'matChipInput, matChipInputFor',
  host: {
    // TODO: eventually we should remove `mat-input-element` from here since it comes from the
    // non-MDC version of the input. It's currently being kept for backwards compatibility, because
    // the MDC chips were landed initially with it.
    'class': 'mat-mdc-chip-input mat-mdc-input-element mdc-text-field__input mat-input-element',
    '(keydown)': '_keydown($event)',
    '(keyup)': '_keyup($event)',
    '(blur)': '_blur()',
    '(focus)': '_focus()',
    '(input)': '_onInput()',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.placeholder]': 'placeholder || null',
    '[attr.aria-invalid]': '_chipGrid && _chipGrid.ngControl ? _chipGrid.ngControl.invalid : null',
    '[attr.aria-required]': '_chipGrid && _chipGrid.required || null',
    '[attr.required]': '_chipGrid && _chipGrid.required || null',
  }
})
export class MatChipInput implements MatChipTextControl, AfterContentInit, OnChanges, OnDestroy {
  /** Used to prevent focus moving to chips while user is holding backspace */
  private _focusLastChipOnBackspace: boolean;

  /** Whether the control is focused. */
  focused: boolean = false;
  _chipGrid: MatChipGrid;

  /** Register input for chip list */
  @Input('matChipInputFor')
  set chipGrid(value: MatChipGrid) {
    if (value) {
      this._chipGrid = value;
      this._chipGrid.registerInput(this);
    }
  }

  /**
   * Whether or not the chipEnd event will be emitted when the input is blurred.
   */
  @Input('matChipInputAddOnBlur')
  get addOnBlur(): boolean { return this._addOnBlur; }
  set addOnBlur(value: boolean) { this._addOnBlur = coerceBooleanProperty(value); }
  _addOnBlur: boolean = false;

  /**
   * The list of key codes that will trigger a chipEnd event.
   *
   * Defaults to `[ENTER]`.
   */
  @Input('matChipInputSeparatorKeyCodes')
  separatorKeyCodes: readonly number[] | ReadonlySet<number> =
      this._defaultOptions.separatorKeyCodes;

  /** Emitted when a chip is to be added. */
  @Output('matChipInputTokenEnd')
  readonly chipEnd: EventEmitter<MatChipInputEvent> = new EventEmitter<MatChipInputEvent>();

  /** The input's placeholder text. */
  @Input() placeholder: string = '';

  /** Unique id for the input. */
  @Input() id: string = `mat-mdc-chip-list-input-${nextUniqueId++}`;

  /** Whether the input is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled || (this._chipGrid && this._chipGrid.disabled); }
  set disabled(value: boolean) { this._disabled = coerceBooleanProperty(value); }
  private _disabled: boolean = false;

  /** Whether the input is empty. */
  get empty(): boolean { return !this.inputElement.value; }

  /** The native input element to which this directive is attached. */
  readonly inputElement: HTMLInputElement;

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement>,
    @Inject(MAT_CHIPS_DEFAULT_OPTIONS) private _defaultOptions: MatChipsDefaultOptions,
    @Optional() @Inject(MAT_FORM_FIELD) formField?: MatFormField) {
      this.inputElement = this._elementRef.nativeElement as HTMLInputElement;

      if (formField) {
        this.inputElement.classList.add('mat-mdc-form-field-input-control');
      }
    }

  ngOnChanges() {
    this._chipGrid.stateChanges.next();
  }

  ngOnDestroy(): void {
    this.chipEnd.complete();
  }

  ngAfterContentInit(): void {
    this._focusLastChipOnBackspace = this.empty;
  }

  /** Utility method to make host definition/tests more clear. */
  _keydown(event?: KeyboardEvent) {
    if (event) {
      // Allow the user's focus to escape when they're tabbing forward. Note that we don't
      // want to do this when going backwards, because focus should go back to the first chip.
      if (event.keyCode === TAB && !hasModifierKey(event, 'shiftKey')) {
        this._chipGrid._allowFocusEscape();
      }

      // To prevent the user from accidentally deleting chips when pressing BACKSPACE continuously,
      // We focus the last chip on backspace only after the user has released the backspace button,
      // And the input is empty (see behaviour in _keyup)
      if (event.keyCode === BACKSPACE && this._focusLastChipOnBackspace) {
        if (this._chipGrid._chips.length) {
          this._chipGrid._keyManager.setLastCellActive();
        }
        event.preventDefault();
        return;
      } else {
        this._focusLastChipOnBackspace = false;
      }
    }

    this._emitChipEnd(event);
  }

  /**
   * Pass events to the keyboard manager. Available here for tests.
   */
  _keyup(event: KeyboardEvent) {
    // Allow user to move focus to chips next time he presses backspace
    if (!this._focusLastChipOnBackspace && event.keyCode === BACKSPACE && this.empty) {
      this._focusLastChipOnBackspace = true;
      event.preventDefault();
    }
  }

  /** Checks to see if the blur should emit the (chipEnd) event. */
  _blur() {
    if (this.addOnBlur) {
      this._emitChipEnd();
    }
    this.focused = false;
    // Blur the chip list if it is not focused
    if (!this._chipGrid.focused) {
      this._chipGrid._blur();
    }
    this._chipGrid.stateChanges.next();
  }

  _focus() {
    this.focused = true;
    this._focusLastChipOnBackspace = this.empty;
    this._chipGrid.stateChanges.next();
  }

  /** Checks to see if the (chipEnd) event needs to be emitted. */
  _emitChipEnd(event?: KeyboardEvent) {
    if (!this.inputElement.value && !!event) {
      this._chipGrid._keydown(event);
    }

    if (!event || this._isSeparatorKey(event)) {
      this.chipEnd.emit({
        input: this.inputElement,
        value: this.inputElement.value,
        chipInput: this,
      });

      event?.preventDefault();
    }
  }

  _onInput() {
    // Let chip list know whenever the value changes.
    this._chipGrid.stateChanges.next();
  }

  /** Focuses the input. */
  focus(): void {
    this.inputElement.focus();
  }

  /** Clears the input */
  clear(): void {
    this.inputElement.value = '';
    this._focusLastChipOnBackspace = true;
  }

  /** Checks whether a keycode is one of the configured separators. */
  private _isSeparatorKey(event: KeyboardEvent) {
    return !hasModifierKey(event) && new Set(this.separatorKeyCodes).has(event.keyCode);
  }

  static ngAcceptInputType_addOnBlur: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}
