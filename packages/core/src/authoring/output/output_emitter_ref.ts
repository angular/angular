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
 * @publicAPI
 */
export class OutputEmitterRef<T> implements OutputRef<T> {
  private destroyed = false;
  private listeners: Array<(value: T) => void> | null = null;
  private errorHandler = inject(ErrorHandler, {optional: true});

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
        const idx = this.listeners?.indexOf(callback);
        if (idx !== undefined && idx !== -1) {
          this.listeners?.splice(idx, 1);
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

    const previousConsumer = setActiveConsumer(null);
    try {
      for (const listenerFn of this.listeners) {
        try {
          listenerFn(value);
        } catch (err: unknown) {
          this.errorHandler?.handleError(err);
        }
      }
    } finally {
      setActiveConsumer(previousConsumer);
    }
  }
}

/** Gets the owning `DestroyRef` for the given output. */
export function getOutputDestroyRef(ref: OutputRef<unknown>): DestroyRef | undefined {
  return ref.destroyRef;
}
