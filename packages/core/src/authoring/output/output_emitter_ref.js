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
import {formatRuntimeError, RuntimeError} from '../../errors';
import {DestroyRef} from '../../linker/destroy_ref';
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
export class OutputEmitterRef {
  constructor() {
    this.destroyed = false;
    this.listeners = null;
    this.errorHandler = inject(ErrorHandler, {optional: true});
    /** @internal */
    this.destroyRef = inject(DestroyRef);
    // Clean-up all listeners and mark as destroyed upon destroy.
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.listeners = null;
    });
  }
  subscribe(callback) {
    if (this.destroyed) {
      throw new RuntimeError(
        953 /* RuntimeErrorCode.OUTPUT_REF_DESTROYED */,
        ngDevMode &&
          'Unexpected subscription to destroyed `OutputRef`. ' +
            'The owning directive/component is destroyed.',
      );
    }
    (this.listeners ?? (this.listeners = [])).push(callback);
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
  emit(value) {
    if (this.destroyed) {
      console.warn(
        formatRuntimeError(
          953 /* RuntimeErrorCode.OUTPUT_REF_DESTROYED */,
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
        } catch (err) {
          this.errorHandler?.handleError(err);
        }
      }
    } finally {
      setActiveConsumer(previousConsumer);
    }
  }
}
/** Gets the owning `DestroyRef` for the given output. */
export function getOutputDestroyRef(ref) {
  return ref.destroyRef;
}
//# sourceMappingURL=output_emitter_ref.js.map
