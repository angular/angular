/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../../primitives/signals';

import {inject} from '../../di/injector_compatibility';
import {ErrorHandler} from '../../error_handler';
import {formatRuntimeError, RuntimeError, RuntimeErrorCode} from '../../errors';
import {DestroyRef} from '../../linker/destroy_ref';

import {OutputRef, OutputRefSubscription} from './output_ref';

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
 * @see [Custom events with outputs](guide/components/outputs)
 *
 * @publicAPI
 */
export class OutputEmitterRef<T> implements OutputRef<T> {
  private destroyed = false;
  private listeners: Array<((value: T) => void) | null> | null = null;
  private errorHandler = inject(ErrorHandler, {optional: true});
  private isEmitting = false;
  private hasNullListeners = false;

  /** @internal */
  destroyRef: DestroyRef = inject(DestroyRef);

  constructor() {
    // Clean-up all listeners and mark as destroyed upon destroy.
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.listeners = null;
    });
  }

  subscribe(callback: (value: T) => void): OutputRefSubscription {
    if (this.destroyed) {
      throw new RuntimeError(
        RuntimeErrorCode.OUTPUT_REF_DESTROYED,
        ngDevMode &&
          'Unexpected subscription to destroyed `OutputRef`. ' +
            'The owning directive/component is destroyed.',
      );
    }

    (this.listeners ??= []).push(callback);

    return {
      unsubscribe: () => {
        const index = this.listeners ? this.listeners.indexOf(callback) : -1;
        if (index > -1) {
          // If we try to unsubscribe while an `emit` is happening, we can throw off the loop.
          // Replace the listener with null so we can clean it up later. Note that it would be
          // simpler to clone the array when iterating over it, but we're trying to avoid cloning
          // since unsubscribing from within the event should be fairly uncommon.
          if (this.isEmitting) {
            this.hasNullListeners = true;
            this.listeners![index] = null;
          } else {
            this.listeners!.splice(index, 1);
          }
        }
      },
    };
  }

  /** Emits a new value to the output. */
  emit(value: T): void {
    if (this.destroyed) {
      console.warn(
        formatRuntimeError(
          RuntimeErrorCode.OUTPUT_REF_DESTROYED,
          ngDevMode &&
            'Unexpected emit for destroyed `OutputRef`. ' +
              'The owning directive/component is destroyed.',
        ),
      );
      return;
    }

    if (this.listeners === null) {
      return;
    }

    this.isEmitting = true;
    const previousConsumer = setActiveConsumer(null);
    try {
      for (const listenerFn of this.listeners) {
        try {
          if (listenerFn !== null) {
            listenerFn(value);
          }
        } catch (err: unknown) {
          this.errorHandler?.handleError(err);
        }
      }
    } finally {
      if (this.hasNullListeners) {
        this.hasNullListeners = false;
        this.listeners && removeNullValues(this.listeners);
      }
      setActiveConsumer(previousConsumer);
      this.isEmitting = false;
    }
  }
}

function removeNullValues(arr: unknown[]): void {
  let i = arr.length - 1;

  while (i > -1) {
    if (arr[i] === null) {
      arr.splice(i, 1);
    }
    i--;
  }
}

/** Gets the owning `DestroyRef` for the given output. */
export function getOutputDestroyRef(ref: OutputRef<unknown>): DestroyRef | undefined {
  return ref.destroyRef;
}
