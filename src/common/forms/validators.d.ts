import { OpaqueToken } from 'angular2/src/core/di';
import * as modelModule from './model';
/**
 * Providers for validators to be used for {@link Control}s in a form.
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
export declare const NG_VALIDATORS: OpaqueToken;
export declare const NG_ASYNC_VALIDATORS: OpaqueToken;
/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link Control} or collection of
 * controls and returns a {@link StringMap} of errors. A null map means that
 * validation has passed.
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
