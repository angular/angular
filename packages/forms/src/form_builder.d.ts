/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AsyncValidatorFn, ValidatorFn } from './directives/validators';
import { AbstractControl, AbstractControlOptions } from './model/abstract_model';
import { FormArray, UntypedFormArray } from './model/form_array';
import { FormControl, FormControlOptions, FormControlState, UntypedFormControl } from './model/form_control';
import { FormGroup, FormRecord, UntypedFormGroup } from './model/form_group';
/**
 * The union of all validator types that can be accepted by a ControlConfig.
 */
type ValidatorConfig = ValidatorFn | AsyncValidatorFn | ValidatorFn[] | AsyncValidatorFn[];
/**
 * The compiler may not always be able to prove that the elements of the control config are a tuple
 * (i.e. occur in a fixed order). This slightly looser type is used for inference, to catch cases
 * where the compiler cannot prove order and position.
 *
 * For example, consider the simple case `fb.group({foo: ['bar', Validators.required]})`. The
 * compiler will infer this as an array, not as a tuple.
 */
type PermissiveControlConfig<T> = Array<T | FormControlState<T> | ValidatorConfig>;
/**
 * Helper type to allow the compiler to accept [XXXX, { updateOn: string }] as a valid shorthand
 * argument for .group()
 */
interface PermissiveAbstractControlOptions extends Omit<AbstractControlOptions, 'updateOn'> {
    updateOn?: string;
}
/** A map of nullable form controls. */
export type ɵNullableFormControls<T> = {
    [K in keyof T]: ɵElement<T[K], null>;
};
/** A map of non-nullable form controls. */
export type ɵNonNullableFormControls<T> = {
    [K in keyof T]: ɵElement<T[K], never>;
};
/**
 * ControlConfig<T> is a tuple containing a value of type T, plus optional validators and async
 * validators.
 *
 * @publicApi
 */
export type ControlConfig<T> = [
    T | FormControlState<T>,
    (ValidatorFn | ValidatorFn[])?,
    (AsyncValidatorFn | AsyncValidatorFn[])?
];
/**
 * FormBuilder accepts values in various container shapes, as well as raw values.
 * Element returns the appropriate corresponding model class, given the container T.
 * The flag N, if not never, makes the resulting `FormControl` have N in its type.
 */
export type ɵElement<T, N extends null> = [
    T
] extends [FormControl<infer U>] ? FormControl<U> : [
    T
] extends [FormControl<infer U> | undefined] ? FormControl<U> : [
    T
] extends [FormGroup<infer U>] ? FormGroup<U> : [
    T
] extends [FormGroup<infer U> | undefined] ? FormGroup<U> : [
    T
] extends [FormRecord<infer U>] ? FormRecord<U> : [
    T
] extends [FormRecord<infer U> | undefined] ? FormRecord<U> : [
    T
] extends [FormArray<infer U>] ? FormArray<U> : [
    T
] extends [FormArray<infer U> | undefined] ? FormArray<U> : [
    T
] extends [AbstractControl<infer U>] ? AbstractControl<U> : [
    T
] extends [AbstractControl<infer U> | undefined] ? AbstractControl<U> : [
    T
] extends [FormControlState<infer U>] ? FormControl<U | N> : [
    T
] extends [PermissiveControlConfig<infer U>] ? FormControl<Exclude<U, ValidatorConfig | PermissiveAbstractControlOptions> | N> : FormControl<T | N>;
/**
 * @description
 * Creates an `AbstractControl` from a user-specified configuration.
 *
 * The `FormBuilder` provides syntactic sugar that shortens creating instances of a
 * `FormControl`, `FormGroup`, or `FormArray`. It reduces the amount of boilerplate needed to
 * build complex forms.
 *
 * @see [Reactive Forms Guide](guide/forms/reactive-forms)
 *
 * @publicApi
 */
export declare class FormBuilder {
    private useNonNullable;
    /**
     * @description
     * Returns a FormBuilder in which automatically constructed `FormControl` elements
     * have `{nonNullable: true}` and are non-nullable.
     *
     * **Constructing non-nullable controls**
     *
     * When constructing a control, it will be non-nullable, and will reset to its initial value.
     *
     * ```ts
     * let nnfb = new FormBuilder().nonNullable;
     * let name = nnfb.control('Alex'); // FormControl<string>
     * name.reset();
     * console.log(name); // 'Alex'
     * ```
     *
     * **Constructing non-nullable groups or arrays**
     *
     * When constructing a group or array, all automatically created inner controls will be
     * non-nullable, and will reset to their initial values.
     *
     * ```ts
     * let nnfb = new FormBuilder().nonNullable;
     * let name = nnfb.group({who: 'Alex'}); // FormGroup<{who: FormControl<string>}>
     * name.reset();
     * console.log(name); // {who: 'Alex'}
     * ```
     * **Constructing *nullable* fields on groups or arrays**
     *
     * It is still possible to have a nullable field. In particular, any `FormControl` which is
     * *already* constructed will not be altered. For example:
     *
     * ```ts
     * let nnfb = new FormBuilder().nonNullable;
     * // FormGroup<{who: FormControl<string|null>}>
     * let name = nnfb.group({who: new FormControl('Alex')});
     * name.reset(); console.log(name); // {who: null}
     * ```
     *
     * Because the inner control is constructed explicitly by the caller, the builder has
     * no control over how it is created, and cannot exclude the `null`.
     */
    get nonNullable(): NonNullableFormBuilder;
    /**
     * @description
     * Constructs a new `FormGroup` instance. Accepts a single generic argument, which is an object
     * containing all the keys and corresponding inner control types.
     *
     * @param controls A collection of child controls. The key for each child is the name
     * under which it is registered.
     *
     * @param options Configuration options object for the `FormGroup`. The object should have the
     * `AbstractControlOptions` type and might contain the following fields:
     * * `validators`: A synchronous validator function, or an array of validator functions.
     * * `asyncValidators`: A single async validator or array of async validator functions.
     * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur'
     * | submit').
     */
    group<T extends {}>(controls: T, options?: AbstractControlOptions | null): FormGroup<ɵNullableFormControls<T>>;
    /**
     * @description
     * Constructs a new `FormGroup` instance.
     *
     * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
     * Use the `FormBuilder#group` overload with `AbstractControlOptions` instead.
     * Note that `AbstractControlOptions` expects `validators` and `asyncValidators` to be valid
     * validators. If you have custom validators, make sure their validation function parameter is
     * `AbstractControl` and not a sub-class, such as `FormGroup`. These functions will be called
     * with an object of type `AbstractControl` and that cannot be automatically downcast to a
     * subclass, so TypeScript sees this as an error. For example, change the `(group: FormGroup) =>
     * ValidationErrors|null` signature to be `(group: AbstractControl) => ValidationErrors|null`.
     *
     * @param controls A record of child controls. The key for each child is the name
     * under which the control is registered.
     *
     * @param options Configuration options object for the `FormGroup`. The legacy configuration
     * object consists of:
     * * `validator`: A synchronous validator function, or an array of validator functions.
     * * `asyncValidator`: A single async validator or array of async validator functions
     * Note: the legacy format is deprecated and might be removed in one of the next major versions
     * of Angular.
     */
    group(controls: {
        [key: string]: any;
    }, options: {
        [key: string]: any;
    }): FormGroup;
    /**
     * @description
     * Constructs a new `FormRecord` instance. Accepts a single generic argument, which is an object
     * containing all the keys and corresponding inner control types.
     *
     * @param controls A collection of child controls. The key for each child is the name
     * under which it is registered.
     *
     * @param options Configuration options object for the `FormRecord`. The object should have the
     * `AbstractControlOptions` type and might contain the following fields:
     * * `validators`: A synchronous validator function, or an array of validator functions.
     * * `asyncValidators`: A single async validator or array of async validator functions.
     * * `updateOn`: The event upon which the control should be updated (options: 'change' | 'blur'
     * | submit').
     */
    record<T>(controls: {
        [key: string]: T;
    }, options?: AbstractControlOptions | null): FormRecord<ɵElement<T, null>>;
    /** @deprecated Use `nonNullable` instead. */
    control<T>(formState: T | FormControlState<T>, opts: FormControlOptions & {
        initialValueIsDefault: true;
    }): FormControl<T>;
    control<T>(formState: T | FormControlState<T>, opts: FormControlOptions & {
        nonNullable: true;
    }): FormControl<T>;
    /**
     * @deprecated When passing an `options` argument, the `asyncValidator` argument has no effect.
     */
    control<T>(formState: T | FormControlState<T>, opts: FormControlOptions, asyncValidator: AsyncValidatorFn | AsyncValidatorFn[]): FormControl<T | null>;
    control<T>(formState: T | FormControlState<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl<T | null>;
    /**
     * Constructs a new `FormArray` from the given array of configurations,
     * validators and options. Accepts a single generic argument, which is the type of each control
     * inside the array.
     *
     * @param controls An array of child controls or control configs. Each child control is given an
     *     index when it is registered.
     *
     * @param validatorOrOpts A synchronous validator function, or an array of such functions, or an
     *     `AbstractControlOptions` object that contains
     * validation functions and a validation trigger.
     *
     * @param asyncValidator A single async validator or array of async validator functions.
     */
    array<T>(controls: Array<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormArray<ɵElement<T, null>>;
    /** @internal */
    _reduceControls<T>(controls: {
        [k: string]: T | ControlConfig<T> | FormControlState<T> | AbstractControl<T>;
    }): {
        [key: string]: AbstractControl;
    };
    /** @internal */
    _createControl<T>(controls: T | FormControlState<T> | ControlConfig<T> | FormControl<T> | AbstractControl<T>): FormControl<T> | FormControl<T | null> | AbstractControl<T>;
}
/**
 * @description
 * `NonNullableFormBuilder` is similar to {@link FormBuilder}, but automatically constructed
 * {@link FormControl} elements have `{nonNullable: true}` and are non-nullable.
 *
 * @publicApi
 */
export declare abstract class NonNullableFormBuilder {
    /**
     * Similar to `FormBuilder#group`, except any implicitly constructed `FormControl`
     * will be non-nullable (i.e. it will have `nonNullable` set to true). Note
     * that already-constructed controls will not be altered.
     */
    abstract group<T extends {}>(controls: T, options?: AbstractControlOptions | null): FormGroup<ɵNonNullableFormControls<T>>;
    /**
     * Similar to `FormBuilder#record`, except any implicitly constructed `FormControl`
     * will be non-nullable (i.e. it will have `nonNullable` set to true). Note
     * that already-constructed controls will not be altered.
     */
    abstract record<T>(controls: {
        [key: string]: T;
    }, options?: AbstractControlOptions | null): FormRecord<ɵElement<T, never>>;
    /**
     * Similar to `FormBuilder#array`, except any implicitly constructed `FormControl`
     * will be non-nullable (i.e. it will have `nonNullable` set to true). Note
     * that already-constructed controls will not be altered.
     */
    abstract array<T>(controls: Array<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormArray<ɵElement<T, never>>;
    /**
     * Similar to `FormBuilder#control`, except this overridden version of `control` forces
     * `nonNullable` to be `true`, resulting in the control always being non-nullable.
     */
    abstract control<T>(formState: T | FormControlState<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl<T>;
}
/**
 * UntypedFormBuilder is the same as `FormBuilder`, but it provides untyped controls.
 */
export declare class UntypedFormBuilder extends FormBuilder {
    /**
     * Like `FormBuilder#group`, except the resulting group is untyped.
     */
    group(controlsConfig: {
        [key: string]: any;
    }, options?: AbstractControlOptions | null): UntypedFormGroup;
    /**
     * @deprecated This API is not typesafe and can result in issues with Closure Compiler renaming.
     * Use the `FormBuilder#group` overload with `AbstractControlOptions` instead.
     */
    group(controlsConfig: {
        [key: string]: any;
    }, options: {
        [key: string]: any;
    }): UntypedFormGroup;
    /**
     * Like `FormBuilder#control`, except the resulting control is untyped.
     */
    control(formState: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): UntypedFormControl;
    /**
     * Like `FormBuilder#array`, except the resulting array is untyped.
     */
    array(controlsConfig: any[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): UntypedFormArray;
}
export {};
