/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, InjectionToken, Renderer2} from '@angular/core';

/**
 * @description
 * Defines an interface that acts as a bridge between the Angular forms API and a
 * native element in the DOM.
 *
 * Implement this interface to create a custom form control directive
 * that integrates with Angular forms.
 *
 * @see DefaultValueAccessor
 *
 * @publicApi
 */
export interface ControlValueAccessor {
  /**
   * @description
   * Writes a new value to the element.
   *
   * This method is called by the forms API to write to the view when programmatic
   * changes from model to view are requested.
   *
   * @usageNotes
   * ### Write a value to the element
   *
   * The following example writes a value to the native DOM element.
   *
   * ```ts
   * writeValue(value: any): void {
   *   this._renderer.setProperty(this._elementRef.nativeElement, 'value', value);
   * }
   * ```
   *
   * @param obj The new value for the element
   */
  writeValue(obj: any): void;

  /**
   * @description
   * Registers a callback function that is called when the control's value
   * changes in the UI.
   *
   * This method is called by the forms API on initialization to update the form
   * model when values propagate from the view to the model.
   *
   * When implementing the `registerOnChange` method in your own value accessor,
   * save the given function so your class calls it at the appropriate time.
   *
   * @usageNotes
   * ### Store the change function
   *
   * The following example stores the provided function as an internal method.
   *
   * ```ts
   * registerOnChange(fn: (_: any) => void): void {
   *   this._onChange = fn;
   * }
   * ```
   *
   * When the value changes in the UI, call the registered
   * function to allow the forms API to update itself:
   *
   * ```ts
   * host: {
   *    '(change)': '_onChange($event.target.value)'
   * }
   * ```
   *
   * @param fn The callback function to register
   */
  registerOnChange(fn: any): void;

  /**
   * @description
   * Registers a callback function that is called by the forms API on initialization
   * to update the form model on blur.
   *
   * When implementing `registerOnTouched` in your own value accessor, save the given
   * function so your class calls it when the control should be considered
   * blurred or "touched".
   *
   * @usageNotes
   * ### Store the callback function
   *
   * The following example stores the provided function as an internal method.
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
   *
   * @param fn The callback function to register
   */
  registerOnTouched(fn: any): void;

  /**
   * @description
   * Function that is called by the forms API when the control status changes to
   * or from 'DISABLED'. Depending on the status, it enables or disables the
   * appropriate DOM element.
   *
   * @usageNotes
   * The following is an example of writing the disabled property to a native DOM element:
   *
   * ```ts
   * setDisabledState(isDisabled: boolean): void {
   *   this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
   * }
   * ```
   *
   * @param isDisabled The disabled status to set on the element
   */
  setDisabledState?(isDisabled: boolean): void;
}

/**
 * Base class for all ControlValueAccessor classes defined in Forms package.
 * Contains common logic and utility functions.
 *
 * Note: this is an *internal-only* class and should not be extended or used directly in
 * applications code.
 */
@Directive()
export class BaseControlValueAccessor {
  /**
   * The registered callback function called when a change or input event occurs on the input
   * element.
   * @nodoc
   */
  onChange = (_: any) => {};

  /**
   * The registered callback function called when a blur event occurs on the input element.
   * @nodoc
   */
  onTouched = () => {};

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  /**
   * Helper method that sets a property on a target element using the current Renderer
   * implementation.
   * @nodoc
   */
  protected setProperty(key: string, value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, key, value);
  }

  /**
   * Registers a function called when the control is touched.
   * @nodoc
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  /**
   * Sets the "disabled" property on the range input element.
   * @nodoc
   */
  setDisabledState(isDisabled: boolean): void {
    this.setProperty('disabled', isDisabled);
  }
}

/**
 * Base class for all built-in ControlValueAccessor classes (except DefaultValueAccessor, which is
 * used in case no other CVAs can be found). We use this class to distinguish between default CVA,
 * built-in CVAs and custom CVAs, so that Forms logic can recognize built-in CVAs and treat custom
 * ones with higher priority (when both built-in and custom CVAs are present).
 *
 * Note: this is an *internal-only* class and should not be extended or used directly in
 * applications code.
 */
@Directive()
export class BuiltInControlValueAccessor extends BaseControlValueAccessor {
}

/**
 * Used to provide a `ControlValueAccessor` for form controls.
 *
 * See `DefaultValueAccessor` for how to implement one.
 *
 * @publicApi
 */
export const NG_VALUE_ACCESSOR =
    new InjectionToken<ReadonlyArray<ControlValueAccessor>>('NgValueAccessor');
