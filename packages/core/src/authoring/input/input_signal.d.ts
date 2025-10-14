/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SIGNAL } from '../../../primitives/signals';
import { Signal } from '../../render3/reactivity/api';
import { InputSignalNode } from './input_signal_node';
/**
 * @publicAPI
 *
 * Options for signal inputs.
 */
export interface InputOptions<T, TransformT> {
    /** Optional public name for the input. By default, the class field name is used. */
    alias?: string;
    /**
     * Optional transform that runs whenever a new value is bound. Can be used to
     * transform the input value before the input is updated.
     *
     * The transform function can widen the type of the input. For example, consider
     * an input for `disabled`. In practice, as the component author, you want to only
     * deal with a boolean, but users may want to bind a string if they just use the
     * attribute form to bind to the input via `<my-dir input>`. A transform can then
     * handle such string values and convert them to `boolean`. See: {@link booleanAttribute}.
     */
    transform?: (v: TransformT) => T;
    /**
     * A debug name for the input signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * Signal input options without the transform option.
 *
 * @publicApi 19.0
 */
export type InputOptionsWithoutTransform<T> = Omit<InputOptions<T, T>, 'transform'> & {
    transform?: undefined;
};
/**
 * Signal input options with the transform option required.
 *
 * @publicAPI
 */
export type InputOptionsWithTransform<T, TransformT> = Required<Pick<InputOptions<T, TransformT>, 'transform'>> & InputOptions<T, TransformT>;
export declare const ɵINPUT_SIGNAL_BRAND_READ_TYPE: unique symbol;
export declare const ɵINPUT_SIGNAL_BRAND_WRITE_TYPE: unique symbol;
/**
 * `InputSignalWithTransform` represents a special `Signal` for a
 * directive/component input with a `transform` function.
 *
 * Signal inputs with transforms capture an extra generic for their transform write
 * type. Transforms can expand the accepted bound values for an input while ensuring
 * value retrievals of the signal input are still matching the generic input type.
 *
 * ```ts
 * class MyDir {
 *   disabled = input(false, {
 *     transform: (v: string|boolean) => convertToBoolean(v),
 *   }); // InputSignalWithTransform<boolean, string|boolean>
 *
 *   click() {
 *     this.disabled() // always returns a `boolean`.
 *   }
 * }
 * ```
 *
 * @see {@link InputSignal} for additional information.
 *
 * @publicApi 19.0
 */
export interface InputSignalWithTransform<T, TransformT> extends Signal<T> {
    [SIGNAL]: InputSignalNode<T, TransformT>;
    [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: T;
    [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: TransformT;
}
/**
 * `InputSignal` represents a special `Signal` for a directive/component input.
 *
 * An input signal is similar to a non-writable signal except that it also
 * carries additional type-information for transforms, and that Angular internally
 * updates the signal whenever a new value is bound.
 *
 * @see {@link InputOptionsWithTransform} for inputs with transforms.
 *
 * @publicApi 19.0
 */
export interface InputSignal<T> extends InputSignalWithTransform<T, T> {
}
/**
 * Creates an input signal.
 *
 * @param initialValue The initial value.
 *   Can be set to {@link REQUIRED_UNSET_VALUE} for required inputs.
 * @param options Additional options for the input. e.g. a transform, or an alias.
 */
export declare function createInputSignal<T, TransformT>(initialValue: T, options?: InputOptions<T, TransformT>): InputSignalWithTransform<T, TransformT>;
