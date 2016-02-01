import {OpaqueToken} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';

/**
 * A bridge between a control and a native element.
 *
 * A `ControlValueAccessor` abstracts the operations of writing a new value to a
 * DOM element representing an input control.
 *
 * Please see {@link DefaultValueAccessor} for more information.
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
}

/**
 * Used to provide a {@link ControlValueAccessor} for form controls.
 *
 * See {@link DefaultValueAccessor} for how to implement one.
 */
export const NG_VALUE_ACCESSOR: OpaqueToken = CONST_EXPR(new OpaqueToken("NgValueAccessor"));