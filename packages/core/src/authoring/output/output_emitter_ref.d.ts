/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DestroyRef } from '../../linker/destroy_ref';
import { OutputRef, OutputRefSubscription } from './output_ref';
/**
 * An `OutputEmitterRef` is created by the `output()` function and can be
 * used to emit values to consumers of your directive or component.
 *
 * Consumers of your directive/component can bind to the output and
 * subscribe to changes via the bound event syntax. For example:
 *
 * ```html
 * <my-comp (valueChange)="processNewValue($event)" />
 * ```
 *
 * @publicAPI
 */
export declare class OutputEmitterRef<T> implements OutputRef<T> {
    private destroyed;
    private listeners;
    private errorHandler;
    /** @internal */
    destroyRef: DestroyRef;
    constructor();
    subscribe(callback: (value: T) => void): OutputRefSubscription;
    /** Emits a new value to the output. */
    emit(value: T): void;
}
/** Gets the owning `DestroyRef` for the given output. */
export declare function getOutputDestroyRef(ref: OutputRef<unknown>): DestroyRef | undefined;
