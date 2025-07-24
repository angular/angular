/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {producerAccessed, SIGNAL, signalSetFn} from '../../../primitives/signals';

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Signal} from '../../render3/reactivity/api';
import {
  signalAsReadonlyFn,
  WritableSignal,
  ɵWRITABLE_SIGNAL,
} from '../../render3/reactivity/signal';
import {
  InputSignal,
  ɵINPUT_SIGNAL_BRAND_READ_TYPE,
  ɵINPUT_SIGNAL_BRAND_WRITE_TYPE,
} from '../input/input_signal';
import {INPUT_SIGNAL_NODE, InputSignalNode, REQUIRED_UNSET_VALUE} from '../input/input_signal_node';
import {OutputEmitterRef} from '../output/output_emitter_ref';
import {OutputRef} from '../output/output_ref';

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
export function createModelSignal<T>(initialValue: T, opts?: ModelOptions): ModelSignal<T> {
  const node: InputSignalNode<T, T> = Object.create(INPUT_SIGNAL_NODE);
  const emitterRef = new OutputEmitterRef<T>();

  node.value = initialValue;

  function getter(): T {
    producerAccessed(node);
    assertModelSet(node.value);
    return node.value;
  }

  getter[SIGNAL] = node;
  getter.asReadonly = signalAsReadonlyFn.bind(getter as any) as () => Signal<T>;

  // TODO: Should we throw an error when updating a destroyed model?
  getter.set = (newValue: T) => {
    if (!node.equal(node.value, newValue)) {
      signalSetFn(node, newValue);
      emitterRef.emit(newValue);
    }
  };

  getter.update = (updateFn: (value: T) => T) => {
    assertModelSet(node.value);
    getter.set(updateFn(node.value));
  };

  getter.subscribe = emitterRef.subscribe.bind(emitterRef);
  getter.destroyRef = emitterRef.destroyRef;

  if (ngDevMode) {
    getter.toString = () => `[Model Signal: ${getter()}]`;
    node.debugName = opts?.debugName;
  }

  return getter as typeof getter &
    Pick<
      ModelSignal<T>,
      | typeof ɵINPUT_SIGNAL_BRAND_READ_TYPE
      | typeof ɵINPUT_SIGNAL_BRAND_WRITE_TYPE
      | typeof ɵWRITABLE_SIGNAL
    >;
}

/** Asserts that a model's value is set. */
function assertModelSet(value: unknown): void {
  if (value === REQUIRED_UNSET_VALUE) {
    throw new RuntimeError(
      RuntimeErrorCode.REQUIRED_MODEL_NO_VALUE,
      ngDevMode && 'Model is required but no value is available yet.',
    );
  }
}
