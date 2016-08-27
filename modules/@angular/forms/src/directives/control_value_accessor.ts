/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core';

/**
 * A bridge between a control and a native element.
 *
 * A `ControlValueAccessor` abstracts the operations of writing a new value to a
 * DOM element representing an input control.
 *
 * Please see {@link DefaultValueAccessor} for more information.
 *
 * @stable
 */
export interface ControlValueAccessor {
  /**
   * Write a new value to the element.
   */
  writeValue(obj: any): void;

  /**
   * Set the function to be called when the control receives a change event.
   */
  registerOnChange(fn: any): void;

  /**
   * Set the function to be called when the control receives a touch event.
   */
  registerOnTouched(fn: any): void;

  /**
   * This function is called when the control status changes to or from "DISABLED".
   * Depending on the value, it will enable or disable the appropriate DOM element.
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
export const NG_VALUE_ACCESSOR: OpaqueToken = new OpaqueToken('NgValueAccessor');
