library angular2.src.common.forms.validators;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/core.dart" show OpaqueToken;
import "model.dart" as modelModule;

/**
 * Providers for validators to be used for [Control]s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * ### Example
 *
 * ```typescript
 * var providers = [
 *   new Provider(NG_VALIDATORS, {useValue: myValidator, multi: true})
 * ];
 * ```
 */
const OpaqueToken NG_VALIDATORS = const OpaqueToken("NgValidators");
const OpaqueToken NG_ASYNC_VALIDATORS = const OpaqueToken("NgAsyncValidators");

/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a [Control] or collection of
 * controls and returns a [StringMap] of errors. A null map means that
 * validation has passed.
 *
 * ### Example
 *
 * ```typescript
 * var loginControl = new Control("", Validators.required)
 * ```
 */
class Validators {
  /**
   * Validator that requires controls to have a non-empty value.
   */
  static Map<String, bool> required(modelModule.Control control) {
    return isBlank(control.value) || control.value == ""
        ? {"required": true}
        : null;
  }

  /**
   * Validator that requires controls to have a value of a minimum length.
   */
  static Function minLength(num minLength) {
    return /* Map < String , dynamic > */ (modelModule.Control control) {
      if (isPresent(Validators.required(control))) return null;
      String v = control.value;
      return v.length < minLength
          ? {
              "minlength": {
                "requiredLength": minLength,
                "actualLength": v.length
              }
            }
          : null;
    };
  }

  /**
   * Validator that requires controls to have a value of a maximum length.
   */
  static Function maxLength(num maxLength) {
    return /* Map < String , dynamic > */ (modelModule.Control control) {
      if (isPresent(Validators.required(control))) return null;
      String v = control.value;
      return v.length > maxLength
          ? {
              "maxlength": {
                "requiredLength": maxLength,
                "actualLength": v.length
              }
            }
          : null;
    };
  }

  /**
   * No-op validator.
   */
  static Map<String, bool> nullValidator(dynamic c) {
    return null;
  }

  /**
   * Compose multiple validators into a single function that returns the union
   * of the individual error maps.
   */
  static Function compose(List<Function> validators) {
    if (isBlank(validators)) return null;
    var presentValidators = validators.where(isPresent).toList();
    if (presentValidators.length == 0) return null;
    return (modelModule.AbstractControl control) {
      return _mergeErrors(_executeValidators(control, presentValidators));
    };
  }

  static Function composeAsync(List<Function> validators) {
    if (isBlank(validators)) return null;
    var presentValidators = validators.where(isPresent).toList();
    if (presentValidators.length == 0) return null;
    return (modelModule.AbstractControl control) {
      var promises = _executeValidators(control, presentValidators)
          .map(_convertToPromise)
          .toList();
      return PromiseWrapper.all(promises).then(_mergeErrors);
    };
  }
}

dynamic _convertToPromise(dynamic obj) {
  return PromiseWrapper.isPromise(obj) ? obj : ObservableWrapper.toPromise(obj);
}

List<dynamic> _executeValidators(
    modelModule.AbstractControl control, List<Function> validators) {
  return validators.map((v) => v(control)).toList();
}

Map<String, dynamic> _mergeErrors(List<dynamic> arrayOfErrors) {
  var res = arrayOfErrors.fold({}, (res, errors) {
    return isPresent(errors)
        ? StringMapWrapper.merge((res as dynamic), (errors as dynamic))
        : res;
  });
  return StringMapWrapper.isEmpty(res) ? null : res;
}
