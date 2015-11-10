library angular2.src.common.forms.directives.shared;

import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/lang.dart"
    show isBlank, isPresent, looseIdentical;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "control_container.dart" show ControlContainer;
import "ng_control.dart" show NgControl;
import "abstract_control_directive.dart" show AbstractControlDirective;
import "ng_control_group.dart" show NgControlGroup;
import "../model.dart" show Control, ControlGroup;
import "../validators.dart" show Validators;
import "control_value_accessor.dart" show ControlValueAccessor;
import "package:angular2/src/core/linker.dart" show ElementRef, QueryList;
import "package:angular2/src/core/render.dart" show Renderer;
import "default_value_accessor.dart" show DefaultValueAccessor;
import "number_value_accessor.dart" show NumberValueAccessor;
import "checkbox_value_accessor.dart" show CheckboxControlValueAccessor;
import "select_control_value_accessor.dart" show SelectControlValueAccessor;
import "normalize_validator.dart" show normalizeValidator;

List<String> controlPath(String name, ControlContainer parent) {
  var p = ListWrapper.clone(parent.path);
  p.add(name);
  return p;
}

void setUpControl(Control control, NgControl dir) {
  if (isBlank(control)) _throwError(dir, "Cannot find control");
  if (isBlank(dir.valueAccessor)) _throwError(dir, "No value accessor for");
  control.validator = Validators.compose([control.validator, dir.validator]);
  control.asyncValidator =
      Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
  dir.valueAccessor.writeValue(control.value);
  // view -> model
  dir.valueAccessor.registerOnChange((newValue) {
    dir.viewToModelUpdate(newValue);
    control.updateValue(newValue, emitModelToViewChange: false);
    control.markAsDirty();
  });
  // model -> view
  control
      .registerOnChange((newValue) => dir.valueAccessor.writeValue(newValue));
  // touched
  dir.valueAccessor.registerOnTouched(() => control.markAsTouched());
}

setUpControlGroup(ControlGroup control, NgControlGroup dir) {
  if (isBlank(control)) _throwError(dir, "Cannot find control");
  control.validator = Validators.compose([control.validator, dir.validator]);
  control.asyncValidator =
      Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
}

void _throwError(AbstractControlDirective dir, String message) {
  var path = dir.path.join(" -> ");
  throw new BaseException('''${ message} \'${ path}\'''');
}

setProperty(Renderer renderer, ElementRef elementRef, String propName,
    dynamic propValue) {
  renderer.setElementProperty(elementRef, propName, propValue);
}

Function composeValidators(List<dynamic> validators) {
  return isPresent(validators)
      ? Validators.compose(validators.map(normalizeValidator).toList())
      : null;
}

Function composeAsyncValidators(List<dynamic> validators) {
  return isPresent(validators)
      ? Validators.composeAsync(validators.map(normalizeValidator).toList())
      : null;
}

bool isPropertyUpdated(Map<String, dynamic> changes, dynamic viewModel) {
  if (!StringMapWrapper.contains(changes, "model")) return false;
  var change = changes["model"];
  if (change.isFirstChange()) return true;
  return !looseIdentical(viewModel, change.currentValue);
}

// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
ControlValueAccessor selectValueAccessor(
    NgControl dir, List<ControlValueAccessor> valueAccessors) {
  if (isBlank(valueAccessors)) return null;
  var defaultAccessor;
  var builtinAccessor;
  var customAccessor;
  valueAccessors.forEach((v) {
    if (v is DefaultValueAccessor) {
      defaultAccessor = v;
    } else if (v is CheckboxControlValueAccessor ||
        v is NumberValueAccessor ||
        v is SelectControlValueAccessor) {
      if (isPresent(builtinAccessor)) _throwError(
          dir, "More than one built-in value accessor matches");
      builtinAccessor = v;
    } else {
      if (isPresent(customAccessor)) _throwError(
          dir, "More than one custom value accessor matches");
      customAccessor = v;
    }
  });
  if (isPresent(customAccessor)) return customAccessor;
  if (isPresent(builtinAccessor)) return builtinAccessor;
  if (isPresent(defaultAccessor)) return defaultAccessor;
  _throwError(dir, "No valid value accessor for");
  return null;
}
