import { Control } from '../model';
import * as modelModule from '../model';
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
export interface Validator {
    validate(c: modelModule.Control): {
        [key: string]: any;
    };
}
/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input ng-control="fullName" required>
 * ```
 */
export declare class RequiredValidator {
}
export declare class MinLengthValidator implements Validator {
    private _validator;
    constructor(minLength: string);
    validate(c: Control): {
        [key: string]: any;
    };
}
export declare class MaxLengthValidator implements Validator {
    private _validator;
    constructor(maxLength: string);
    validate(c: Control): {
        [key: string]: any;
    };
}
