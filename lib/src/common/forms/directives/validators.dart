library angular2.src.common.forms.directives.validators;

import "package:angular2/core.dart"
    show Provider, OpaqueToken, Attribute, Directive;
import "../validators.dart" show Validators, NG_VALIDATORS;
import "../model.dart" show Control;
import "../model.dart" as modelModule;
import "package:angular2/src/facade/lang.dart" show NumberWrapper;

/**
 * An interface that can be implemented by classes that can act as validators.
 *
 * ## Usage
 *
 * ```typescript
 * @Directive({
 *   selector: '[custom-validator]',
 *   providers: [provide(NG_VALIDATORS, {useExisting: CustomValidatorDirective, multi: true})]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(c: Control): {[key: string]: any} {
 *     return {"custom": true};
 *   }
 * }
 * ```
 */
abstract class Validator {
  Map<String, dynamic> validate(modelModule.Control c);
}

const REQUIRED_VALIDATOR =
    const Provider(NG_VALIDATORS, useValue: Validators.required, multi: true);

/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the [NG_VALIDATORS] binding.
 *
 * ### Example
 *
 * ```
 * <input ngControl="fullName" required>
 * ```
 */
@Directive(
    selector:
        "[required][ngControl],[required][ngFormControl],[required][ngModel]",
    providers: const [REQUIRED_VALIDATOR])
class RequiredValidator {}

const MIN_LENGTH_VALIDATOR =
    const Provider(NG_VALIDATORS, useExisting: MinLengthValidator, multi: true);

@Directive(
    selector:
        "[minlength][ngControl],[minlength][ngFormControl],[minlength][ngModel]",
    providers: const [MIN_LENGTH_VALIDATOR])
class MinLengthValidator implements Validator {
  Function _validator;
  MinLengthValidator(@Attribute("minlength") String minLength) {
    this._validator =
        Validators.minLength(NumberWrapper.parseInt(minLength, 10));
  }
  Map<String, dynamic> validate(Control c) {
    return this._validator(c);
  }
}

const MAX_LENGTH_VALIDATOR =
    const Provider(NG_VALIDATORS, useExisting: MaxLengthValidator, multi: true);

@Directive(
    selector:
        "[maxlength][ngControl],[maxlength][ngFormControl],[maxlength][ngModel]",
    providers: const [MAX_LENGTH_VALIDATOR])
class MaxLengthValidator implements Validator {
  Function _validator;
  MaxLengthValidator(@Attribute("maxlength") String maxLength) {
    this._validator =
        Validators.maxLength(NumberWrapper.parseInt(maxLength, 10));
  }
  Map<String, dynamic> validate(Control c) {
    return this._validator(c);
  }
}
