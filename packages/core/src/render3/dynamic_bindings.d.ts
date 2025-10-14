/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { WritableSignal } from '../core_reactivity_export_internal';
import { Type } from '../interface/type';
/** Symbol used to store and retrieve metadata about a binding. */
export declare const BINDING: unique symbol;
/**
 * A dynamically-defined binding targeting.
 * For example, `inputBinding('value', () => 123)` creates an input binding.
 */
export interface Binding {
    readonly [BINDING]: unknown;
}
export interface BindingInternal extends Binding {
    readonly [BINDING]: {
        readonly kind: string;
        readonly requiredVars: number;
    };
    /** Target index (in a view's registry) to which to apply the binding. */
    targetIdx?: number;
    /** Callback that will be invoked during creation. */
    create?(): void;
    /** Callback that will be invoked during updates. */
    update?(): void;
}
/**
 * Represents a dynamically-created directive with bindings targeting it specifically.
 */
export interface DirectiveWithBindings<T> {
    /** Directive type that should be created. */
    type: Type<T>;
    /** Bindings that should be applied to the specific directive. */
    bindings: Binding[];
}
/**
 * Creates an input binding.
 * @param publicName Public name of the input to bind to.
 * @param value Callback that returns the current value for the binding. Can be either a signal or
 *   a plain getter function.
 *
 * ### Usage Example
 * In this example we create an instance of the `MyButton` component and bind the value of
 * the `isDisabled` signal to its `disabled` input.
 *
 * ```
 * const isDisabled = signal(false);
 *
 * createComponent(MyButton, {
 *   bindings: [inputBinding('disabled', isDisabled)]
 * });
 * ```
 */
export declare function inputBinding(publicName: string, value: () => unknown): Binding;
/**
 * Creates an output binding.
 * @param eventName Public name of the output to listen to.
 * @param listener Function to be called when the output emits.
 *
 * ### Usage example
 * In this example we create an instance of the `MyCheckbox` component and listen
 * to its `onChange` event.
 *
 * ```
 * interface CheckboxChange {
 *   value: string;
 * }
 *
 * createComponent(MyCheckbox, {
 *   bindings: [
 *    outputBinding<CheckboxChange>('onChange', event => console.log(event.value))
 *   ],
 * });
 * ```
 */
export declare function outputBinding<T>(eventName: string, listener: (event: T) => unknown): Binding;
/**
 * Creates a two-way binding.
 * @param eventName Public name of the two-way compatible input.
 * @param value Writable signal from which to get the current value and to which to write new
 * values.
 *
 * ### Usage example
 * In this example we create an instance of the `MyCheckbox` component and bind to its `value`
 * input using a two-way binding.
 *
 * ```
 * const checkboxValue = signal('');
 *
 * createComponent(MyCheckbox, {
 *   bindings: [
 *    twoWayBinding('value', checkboxValue),
 *   ],
 * });
 * ```
 */
export declare function twoWayBinding(publicName: string, value: WritableSignal<unknown>): Binding;
