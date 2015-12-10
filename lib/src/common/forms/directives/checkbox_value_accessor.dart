library angular2.src.common.forms.directives.checkbox_value_accessor;

import "package:angular2/core.dart"
    show Directive, Renderer, ElementRef, Self, Provider;
import "control_value_accessor.dart"
    show NG_VALUE_ACCESSOR, ControlValueAccessor;

const CHECKBOX_VALUE_ACCESSOR = const Provider(NG_VALUE_ACCESSOR,
    useExisting: CheckboxControlValueAccessor, multi: true);

/**
 * The accessor for writing a value and listening to changes on a checkbox input element.
 *
 *  ### Example
 *  ```
 *  <input type="checkbox" ngControl="rememberLogin">
 *  ```
 */
@Directive(
    selector:
        "input[type=checkbox][ngControl],input[type=checkbox][ngFormControl],input[type=checkbox][ngModel]",
    host: const {
      "(change)": "onChange(\$event.target.checked)",
      "(blur)": "onTouched()"
    },
    bindings: const [CHECKBOX_VALUE_ACCESSOR])
class CheckboxControlValueAccessor implements ControlValueAccessor {
  Renderer _renderer;
  ElementRef _elementRef;
  var onChange = (_) {};
  var onTouched = () {};
  CheckboxControlValueAccessor(this._renderer, this._elementRef) {}
  void writeValue(dynamic value) {
    this._renderer.setElementProperty(this._elementRef, "checked", value);
  }

  void registerOnChange(dynamic /* (_: any) => {} */ fn) {
    this.onChange = fn;
  }

  void registerOnTouched(dynamic /* () => {} */ fn) {
    this.onTouched = fn;
  }
}
