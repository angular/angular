/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SIGNAL } from '../../../primitives/signals';
import { WritableSignal } from '../../render3/reactivity/signal';
import { InputSignal } from '../input/input_signal';
import { InputSignalNode } from '../input/input_signal_node';
import { OutputRef } from '../output/output_ref';
/**
 * @publicAPI
 *
 * Options for model signals.
 */
export interface ModelOptions {
    /**
     * Optional public name of the input side of the model. The output side will have the same
     * name as the input, but suffixed with `Change`. By default, the class field name is used.
     */
    alias?: string;
    /**
     * A debug name for the model signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * `ModelSignal` represents a special `Signal` for a directive/component model field.
 *
 * A model signal is a writeable signal that can be exposed as an output.
 * Whenever its value is updated, it emits to the output.
 *
 * @publicAPI
 */
export interface ModelSignal<T> extends WritableSignal<T>, InputSignal<T>, OutputRef<T> {
    [SIGNAL]: InputSignalNode<T, T>;
}
/**
 * Creates a model signal.
 *
 * @param initialValue The initial value.
 *   Can be set to {@link REQUIRED_UNSET_VALUE} for required model signals.
 * @param options Additional options for the model.
 */
export declare function createModelSignal<T>(initialValue: T, opts?: ModelOptions): ModelSignal<T>;
