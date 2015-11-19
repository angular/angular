library angular2.src.common.forms.directives.control_value_accessor;

import "package:angular2/core.dart" show OpaqueToken;

/**
 * A bridge between a control and a native element.
 *
 * A `ControlValueAccessor` abstracts the operations of writing a new value to a
 * DOM element representing an input control.
 *
 * Please see [DefaultValueAccessor] for more information.
 */
abstract class ControlValueAccessor {
  /**
   * Write a new value to the element.
   */
  void writeValue(dynamic obj);
  /**
   * Set the function to be called when the control receives a change event.
   */
  void registerOnChange(dynamic fn);
  /**
   * Set the function to be called when the control receives a touch event.
   */
  void registerOnTouched(dynamic fn);
}

const OpaqueToken NG_VALUE_ACCESSOR = const OpaqueToken("NgValueAccessor");
