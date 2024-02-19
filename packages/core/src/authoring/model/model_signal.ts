/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {producerAccessed, SIGNAL, signalSetFn} from '@angular/core/primitives/signals';

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Signal} from '../../render3/reactivity/api';
import {WritableSignal} from '../../render3/reactivity/signal';
import {ɵINPUT_SIGNAL_BRAND_READ_TYPE, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE} from '../input/input_signal';
import {INPUT_SIGNAL_NODE, InputSignalNode, REQUIRED_UNSET_VALUE} from '../input/input_signal_node';

/**
 * @developerPreview
 *
 * Options for model signals.
 */
export interface ModelOptions {
  /**
   * Optional public name of the input side of the model. The output side will have the same
   * name as the input, but suffixed with `Change`. By default, the class field name is used.
   */
  alias?: string;
}

/**
 * `ModelSignal` represents a special `Signal` for a directive/component model field.
 *
 * A model signal is a writeable signal that can be exposed as an output.
 * Whenever its value is updated, it emits to the output.
 *
 * @developerPreview
 */
export interface ModelSignal<T> extends WritableSignal<T> {
  [SIGNAL]: InputSignalNode<T, T>;
  [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: T;
  [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: T;

  // TODO(crisbeto): either make this a public API or mark as internal pending discussion.
  /** @deprecated Do not use, will be removed. */
  subscribe(callback: (value: T) => void): () => void;
}

/**
 * Creates a model signal.
 *
 * @param initialValue The initial value.
 *   Can be set to {@link REQUIRED_UNSET_VALUE} for required model signals.
 * @param options Additional options for the model.
 */
export function createModelSignal<T>(initialValue: T): ModelSignal<T> {
  const subscriptions: ((value: T) => void)[] = [];
  const node: InputSignalNode<T, T> = Object.create(INPUT_SIGNAL_NODE);

  node.value = initialValue;

  function getter(): T {
    producerAccessed(node);
    assertModelSet(node.value);
    return node.value;
  }

  function notifySubscribers(value: T): void {
    for (let i = 0; i < subscriptions.length; i++) {
      subscriptions[i](value);
    }
  }

  (getter as any)[SIGNAL] = node;
  (getter as any).asReadonly = (() => getter()) as Signal<T>;

  getter.set = (newValue: T) => {
    if (!node.equal(node.value, newValue)) {
      signalSetFn(node, newValue);
      notifySubscribers(newValue);
    }
  };

  getter.update = (updateFn: (value: T) => T) => {
    assertModelSet(node.value);
    getter.set(updateFn(node.value));
  };

  getter.subscribe = (callback: (value: T) => void) => {
    subscriptions.push(callback);

    return () => {
      const index = subscriptions.indexOf(callback);

      if (index > -1) {
        subscriptions.splice(index, 1);
      }
    };
  };

  if (ngDevMode) {
    getter.toString = () => `[Model Signal: ${getter()}]`;
  }

  return getter as ModelSignal<T>;
}

/** Asserts that a model's value is set. */
function assertModelSet(value: unknown): void {
  if (value === REQUIRED_UNSET_VALUE) {
    throw new RuntimeError(
        RuntimeErrorCode.REQUIRED_MODEL_NO_VALUE,
        ngDevMode && 'Model is required but no value is available yet.');
  }
}
