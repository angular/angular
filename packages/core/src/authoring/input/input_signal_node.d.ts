/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SignalNode } from '../../../primitives/signals';
export declare const REQUIRED_UNSET_VALUE: unique symbol;
/**
 * Reactive node type for an input signal. An input signal extends a signal.
 * There are special properties to enable transforms and required inputs.
 */
export interface InputSignalNode<T, TransformT> extends SignalNode<T> {
    /**
     * User-configured transform that will run whenever a new value is applied
     * to the input signal node.
     */
    transformFn: ((value: TransformT) => T) | undefined;
    /**
     * Applies a new value to the input signal. Expects transforms to be run
     * manually before.
     *
     * This function is called by the framework runtime code whenever a binding
     * changes. The value can in practice be anything at runtime, but for typing
     * purposes we assume it's a valid `T` value. Type-checking will enforce that.
     */
    applyValueToInputSignal<T, TransformT>(node: InputSignalNode<T, TransformT>, value: T): void;
    /**
     * A debug name for the input signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
export declare const INPUT_SIGNAL_NODE: InputSignalNode<unknown, unknown>;
