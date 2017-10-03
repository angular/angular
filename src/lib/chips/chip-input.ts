/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ENTER} from '@angular/cdk/keycodes';
import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {MatChipList} from './chip-list';


export interface MatChipInputEvent {
  input: HTMLInputElement;
  value: string;
}

/**
 * Directive that adds chip-specific behaviors to an input element inside <mat-form-field>.
 * May be placed inside or outside of an <mat-chip-list>.
 */
@Directive({
  selector: 'input[matChipInputFor]',
  host: {
    'class': 'mat-chip-input mat-input-element',
    '(keydown)': '_keydown($event)',
    '(blur)': '_blur()',
    '(focus)': '_focus()',
  }
})
export class MatChipInput {
  focused: boolean = false;
  _chipList: MatChipList;

  /** Register input for chip list */
  @Input('matChipInputFor')
  set chipList(value: MatChipList) {
    if (value) {
      this._chipList = value;
      this._chipList.registerInput(this);
    }
  }

  /**
   * Whether or not the chipEnd event will be emitted when the input is blurred.
   */
  @Input('matChipInputAddOnBlur')
  get addOnBlur() { return this._addOnBlur; }
  set addOnBlur(value) { this._addOnBlur = coerceBooleanProperty(value); }
  _addOnBlur: boolean = false;

  /**
   * The list of key codes that will trigger a chipEnd event.
   *
   * Defaults to `[ENTER]`.
   */
  // TODO(tinayuangao): Support Set here
  @Input('matChipInputSeparatorKeyCodes') separatorKeyCodes: number[] = [ENTER];

  /** Emitted when a chip is to be added. */
  @Output('matChipInputTokenEnd')
  chipEnd = new EventEmitter<MatChipInputEvent>();

  @Input() placeholder: string = '';

  get empty(): boolean {
    let value: string | null = this._inputElement.value;
    return value == null || value === '';
  }

  /** The native input element to which this directive is attached. */
  protected _inputElement: HTMLInputElement;

  constructor(protected _elementRef: ElementRef) {
    this._inputElement = this._elementRef.nativeElement as HTMLInputElement;
  }

  /** Utility method to make host definition/tests more clear. */
  _keydown(event?: KeyboardEvent) {
    this._emitChipEnd(event);
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
    this._chipList.stateChanges.next();
  }

  /** Checks to see if the (chipEnd) event needs to be emitted. */
  _emitChipEnd(event?: KeyboardEvent) {
    if (!this._inputElement.value && !!event) {
      this._chipList._keydown(event);
    }
    if (!event || this.separatorKeyCodes.indexOf(event.keyCode) > -1) {
      this.chipEnd.emit({ input: this._inputElement, value: this._inputElement.value });

      if (event) {
        event.preventDefault();
      }
    }
  }

  focus() { this._inputElement.focus(); }
}
