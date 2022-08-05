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
  Output,
} from '@angular/core';
import {MatLegacyChipsDefaultOptions, MAT_CHIPS_DEFAULT_OPTIONS} from './chip-default-options';
import {MatLegacyChipList} from './chip-list';
import {MatLegacyChipTextControl} from './chip-text-control';

/** Represents an input event on a `matChipInput`. */
export interface MatLegacyChipInputEvent {
  /**
   * The native `<input>` element that the event is being fired for.
   * @deprecated Use `MatChipInputEvent#chipInput.inputElement` instead.
   * @breaking-change 13.0.0 This property will be removed.
   */
  input: HTMLInputElement;

  /** The value of the input. */
  value: string;

  /** Reference to the chip input that emitted the event. */
  chipInput: MatLegacyChipInput;
}

// Increasing integer for generating unique ids.
let nextUniqueId = 0;

/**
 * Directive that adds chip-specific behaviors to an input element inside `<mat-form-field>`.
 * May be placed inside or outside of an `<mat-chip-list>`.
 */
@Directive({
  selector: 'input[matChipInputFor]',
  exportAs: 'matChipInput, matChipInputFor',
  host: {
    'class': 'mat-chip-input mat-input-element',
    '(keydown)': '_keydown($event)',
    '(keyup)': '_keyup($event)',
    '(blur)': '_blur()',
    '(focus)': '_focus()',
    '(input)': '_onInput()',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.placeholder]': 'placeholder || null',
    '[attr.aria-invalid]': '_chipList && _chipList.ngControl ? _chipList.ngControl.invalid : null',
    '[attr.aria-required]': '_chipList && _chipList.required || null',
  },
})
export class MatLegacyChipInput
  implements MatLegacyChipTextControl, OnChanges, OnDestroy, AfterContentInit
{
  /** Used to prevent focus moving to chips while user is holding backspace */
  private _focusLastChipOnBackspace: boolean;

  /** Whether the control is focused. */
  focused: boolean = false;
  _chipList: MatLegacyChipList;

  /** Register input for chip list */
  @Input('matChipInputFor')
  set chipList(value: MatLegacyChipList) {
    if (value) {
      this._chipList = value;
      this._chipList.registerInput(this);
    }
  }

  /**
   * Whether or not the chipEnd event will be emitted when the input is blurred.
   */
  @Input('matChipInputAddOnBlur')
  get addOnBlur(): boolean {
    return this._addOnBlur;
  }
  set addOnBlur(value: BooleanInput) {
    this._addOnBlur = coerceBooleanProperty(value);
  }
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
  @Output('matChipInputTokenEnd') readonly chipEnd = new EventEmitter<MatLegacyChipInputEvent>();

  /** The input's placeholder text. */
  @Input() placeholder: string = '';

  /** Unique id for the input. */
  @Input() id: string = `mat-chip-list-input-${nextUniqueId++}`;

  /** Whether the input is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || (this._chipList && this._chipList.disabled);
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  /** Whether the input is empty. */
  get empty(): boolean {
    return !this.inputElement.value;
  }

  /** The native input element to which this directive is attached. */
  readonly inputElement!: HTMLInputElement;

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement>,
    @Inject(MAT_CHIPS_DEFAULT_OPTIONS) private _defaultOptions: MatLegacyChipsDefaultOptions,
  ) {
    this.inputElement = this._elementRef.nativeElement as HTMLInputElement;
  }

  ngOnChanges(): void {
    this._chipList.stateChanges.next();
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
        this._chipList._allowFocusEscape();
      }

      // To prevent the user from accidentally deleting chips when pressing BACKSPACE continuously,
      // We focus the last chip on backspace only after the user has released the backspace button,
      // and the input is empty (see behaviour in _keyup)
      if (event.keyCode === BACKSPACE && this._focusLastChipOnBackspace) {
        this._chipList._keyManager.setLastItemActive();
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
    if (!this._chipList.focused) {
      this._chipList._blur();
    }
    this._chipList.stateChanges.next();
  }

  _focus() {
    this.focused = true;
    this._focusLastChipOnBackspace = this.empty;
    this._chipList.stateChanges.next();
  }

  /** Checks to see if the (chipEnd) event needs to be emitted. */
  _emitChipEnd(event?: KeyboardEvent) {
    if (!this.inputElement.value && !!event) {
      this._chipList._keydown(event);
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
    this._chipList.stateChanges.next();
  }

  /** Focuses the input. */
  focus(options?: FocusOptions): void {
    this.inputElement.focus(options);
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
}
