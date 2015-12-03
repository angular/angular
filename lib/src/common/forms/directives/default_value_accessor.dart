library angular2.src.common.forms.directives.default_value_accessor;

import "package:angular2/core.dart"
    show Directive, ElementRef, Renderer, Self, Provider;
import "control_value_accessor.dart"
    show NG_VALUE_ACCESSOR, ControlValueAccessor;
import "package:angular2/src/facade/lang.dart" show isBlank;

const DEFAULT_VALUE_ACCESSOR = const Provider(NG_VALUE_ACCESSOR,
    useExisting: DefaultValueAccessor, multi: true);

/**
 * The default accessor for writing a value and listening to changes that is used by the
 * [NgModel], [NgFormControl], and [NgControlName] directives.
 *
 *  ### Example
 *  ```
 *  <input type="text" ng-control="searchQuery">
 *  ```
 */
@Directive(
    selector:
        "input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model],[ng-default-control]",
    host: const {
      "(input)": "onChange(\$event.target.value)",
      "(blur)": "onTouched()"
    },
    bindings: const [DEFAULT_VALUE_ACCESSOR])
class DefaultValueAccessor implements ControlValueAccessor {
  Renderer _renderer;
  ElementRef _elementRef;
  var onChange = (_) {};
  var onTouched = () {};
  DefaultValueAccessor(this._renderer, this._elementRef) {}
  void writeValue(dynamic value) {
    var normalizedValue = isBlank(value) ? "" : value;
    this
        ._renderer
        .setElementProperty(this._elementRef, "value", normalizedValue);
  }

  void registerOnChange(dynamic /* (_: any) => void */ fn) {
    this.onChange = fn;
  }

  void registerOnTouched(dynamic /* () => void */ fn) {
    this.onTouched = fn;
  }
}
