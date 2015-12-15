import { OpaqueToken } from 'angular2/core';
import * as modelModule from './model';
/**
 * Providers for validators to be used for {@link Control}s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * ### Example
 *
 * {@example core/forms/ts/ng_validators/ng_validators.ts region='ng_validators'}
 */
export declare const NG_VALIDATORS: OpaqueToken;
/**
 * Providers for asynchronous validators to be used for {@link Control}s
 * in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * See {@link NG_VALIDATORS} for more details.
 */
export declare const NG_ASYNC_VALIDATORS: OpaqueToken;
/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link Control} or collection of
 * controls and returns a map of errors. A null map means that validation has passed.
 *
 * ### Example
 *
 * ```typescript
 * var loginControl = new Control("", Validators.required)
 * ```
 */
export declare class Validators {
    /**
     * Validator that requires controls to have a non-empty value.
     */
    static required(control: modelModule.Control): {
        [key: string]: boolean;
    };
    /**
     * Validator that requires controls to have a value of a minimum length.
     */
    static minLength(minLength: number): Function;
    /**
     * Validator that requires controls to have a value of a maximum length.
     */
    static maxLength(maxLength: number): Function;
    /**
     * No-op validator.
     */
    static nullValidator(c: any): {
        [key: string]: boolean;
    };
    /**
     * Compose multiple validators into a single function that returns the union
     * of the individual error maps.
     */
    static compose(validators: Function[]): Function;
    static composeAsync(validators: Function[]): Function;
}
