/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/**
 * A `ControlValueAccessor` acts as a bridge between the Angular forms API and a
 * native element in the DOM.
 *
 * Implement this interface if you want to create a custom form control directive
 * that integrates with Angular forms.
 *
 * @stable
 */
export interface ControlValueAccessor {
  /**
   * Writes a new value to the element.
   *
   * This method will be called by the forms API to write to the view when programmatic
   * (model -> view) changes are requested.
   *
   * Example implementation of `writeValue`:
   *
   * ```ts
   * writeValue(value: any): void {
   *   this._renderer.setProperty(this._elementRef.nativeElement, 'value', value);
   * }
   * ```
   */
  writeValue(obj: any): void;

  /**
   * Registers a callback function that should be called when the control's value
   * changes in the UI.
   *
   * This is called by the forms API on initialization so it can update the form
   * model when values propagate from the view (view -> model).
   *
   * If you are implementing `registerOnChange` in your own value accessor, you
   * will typically want to save the given function so your class can call it
   * at the appropriate time.
   *
   * ```ts
   * registerOnChange(fn: (_: any) => void): void {
   *   this._onChange = fn;
   * }
   * ```
   *
   * When the value changes in the UI, your class should call the registered
   * function to allow the forms API to update itself:
   *
   * ```ts
   * host: {
   *    (change): '_onChange($event.target.value)'
   * }
   * ```
   *
   */
  registerOnChange(fn: any): void;

  /**
   * Registers a callback function that should be called when the control receives
   * a blur event.
   *
   * This is called by the forms API on initialization so it can update the form model
   * on blur.
   *
   * If you are implementing `registerOnTouched` in your own value accessor, you
   * will typically want to save the given function so your class can call it
   * when the control should be considered blurred (a.k.a. "touched").
   *
   * ```ts
   * registerOnTouched(fn: any): void {
   *   this._onTouched = fn;
   * }
   * ```
   *
   * On blur (or equivalent), your class should call the registered function to allow
   * the forms API to update itself:
   *
   * ```ts
   * host: {
   *    '(blur)': '_onTouched()'
   * }
   * ```
   */
  registerOnTouched(fn: any): void;

  /**
   * This function is called by the forms API when the control status changes to
   * or from "DISABLED". Depending on the value, it should enable or disable the
   * appropriate DOM element.
   *
   * Example implementation of `setDisabledState`:
   *
   * ```ts
   * setDisabledState(isDisabled: boolean): void {
   *   this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
   * }
   * ```
   *
   * @param isDisabled
   */
  setDisabledState?(isDisabled: boolean): void;
}

/**
 * Used to provide a {@link ControlValueAccessor} for form controls.
 *
 * See {@link DefaultValueAccessor} for how to implement one.
 * @stable
 */
export const NG_VALUE_ACCESSOR = new InjectionToken<ControlValueAccessor>('NgValueAccessor');
