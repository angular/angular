/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ENTER} from '@angular/material/core';
import {MdChipList} from './chip-list';

export interface MdChipInputEvent {
  input: HTMLInputElement;
  value: string;
}

/**
 * Directive that adds chip-specific behaviors to an input element inside <md-form-field>.
 * May be placed inside or outside of an <md-chip-list>.
 */
@Directive({
  selector: 'input[mdChipInputFor], input[matChipInputFor]',
  host: {
    'class': 'mat-chip-input mat-input-element',
    '(keydown)': '_keydown($event)',
    '(blur)': '_blur()',
    '(focus)': '_focus()',
  }
})
export class MdChipInput {
  focused: boolean = false;
  _chipList: MdChipList;

  /** Register input for chip list */
  @Input('mdChipInputFor')
  set chipList(value: MdChipList) {
    if (value) {
      this._chipList = value;
      this._chipList.registerInput(this);
    }
  }

  /**
   * Whether or not the chipEnd event will be emitted when the input is blurred.
   */
  @Input('mdChipInputAddOnBlur')
  get addOnBlur() { return this._addOnBlur; }
  set addOnBlur(value) { this._addOnBlur = coerceBooleanProperty(value); }
  _addOnBlur: boolean = false;

  /**
   * The list of key codes that will trigger a chipEnd event.
   *
   * Defaults to `[ENTER]`.
   */
  // TODO(tinayuangao): Support Set here
  @Input('mdChipInputSeparatorKeyCodes') separatorKeyCodes: number[] = [ENTER];

  /** Emitted when a chip is to be added. */
  @Output('mdChipInputTokenEnd')
  chipEnd = new EventEmitter<MdChipInputEvent>();

  @Input('matChipInputFor')
  set matChipList(value: MdChipList) { this.chipList = value; }

  @Input('matChipInputAddOnBlur')
  get matAddOnBlur() { return this._addOnBlur; }
  set matAddOnBlur(value) { this.addOnBlur = value; }

  @Input('matChipInputSeparatorKeyCodes')
  get matSeparatorKeyCodes() { return this.separatorKeyCodes; }
  set matSeparatorKeyCodes(v: number[]) { this.separatorKeyCodes = v; }

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
