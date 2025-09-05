/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComputationFn,
  createLinkedSignal,
  LinkedSignalGetter,
  LinkedSignalNode,
  linkedSignalSetFn,
  linkedSignalUpdateFn,
  SIGNAL,
} from '../../../primitives/signals';
import {Signal, ValueEqualityFn} from './api';
import {signalAsReadonlyFn, WritableSignal} from './signal';

const identityFn = <T>(v: T) => v;

/**
 * Options passed to the `linkedSignal` creation function.
 */
export interface CreateLinkedSignalOptions<D> {
  /**
   * A comparison function which defines equality for linked signal values.
   */
  equal?: ValueEqualityFn<NoInfer<D>>;

  /**
   * A debug name for the linked signal. Used in Angular DevTools to identify the signal.
   */
  debugName?: string;
}

export interface CreateLinkedSignalWithSourceOptions<S, D> extends CreateLinkedSignalOptions<D> {
  /**
   * A reactive function which provides the source value for the computation.
   */
  source: () => S;

  /**
   * A computation function that derives the linked signal value from the source and optional previous state.
   */
  computation: (source: NoInfer<S>, previous?: {source: NoInfer<S>; value: NoInfer<D>}) => D;
}

/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 *
 * @publicApi 20.0
 */
export function linkedSignal<D>(
  computation: () => D,
  options?: CreateLinkedSignalOptions<D>,
): WritableSignal<D>;

/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 * This is an advanced API form where the computation has access to the previous value of the signal and the computation result.
 *
 * Note: The computation is reactive, meaning the linked signal will automatically update whenever any of the signals used within the computation change.
 *
 * @publicApi 20.0
 */
export function linkedSignal<S, D>(
  options: CreateLinkedSignalWithSourceOptions<S, D>,
): WritableSignal<D>;

export function linkedSignal<S, D>(
  optionsOrComputation: CreateLinkedSignalWithSourceOptions<S, D> | (() => D),
  options?: CreateLinkedSignalOptions<D>,
): WritableSignal<D> {
  if (typeof optionsOrComputation === 'function') {
    const getter = createLinkedSignal<D, D>(
      optionsOrComputation,
      identityFn<D>,
      options?.equal,
    ) as LinkedSignalGetter<D, D> & WritableSignal<D>;
    return upgradeLinkedSignalGetter(getter, options?.debugName);
  } else {
    const getter = createLinkedSignal<S, D>(
      optionsOrComputation.source,
      optionsOrComputation.computation,
      optionsOrComputation.equal,
    );
    return upgradeLinkedSignalGetter(getter, optionsOrComputation.debugName);
  }
}

function upgradeLinkedSignalGetter<S, D>(
  getter: LinkedSignalGetter<S, D>,
  debugName?: string,
): WritableSignal<D> {
  if (ngDevMode) {
    getter.toString = () => `[LinkedSignal: ${getter()}]`;
    getter[SIGNAL].debugName = debugName;
  }

  const node = getter[SIGNAL] as LinkedSignalNode<S, D>;
  const upgradedGetter = getter as LinkedSignalGetter<S, D> & WritableSignal<D>;

  upgradedGetter.set = (newValue: D) => linkedSignalSetFn(node, newValue);
  upgradedGetter.update = (updateFn: (value: D) => D) => linkedSignalUpdateFn(node, updateFn);
  upgradedGetter.asReadonly = signalAsReadonlyFn.bind(getter as any) as () => Signal<D>;

  return upgradedGetter;
}
