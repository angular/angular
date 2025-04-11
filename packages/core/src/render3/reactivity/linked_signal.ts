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
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 *
 * @publicApi 20.0
 */
export function linkedSignal<D>(
  computation: () => D,
  options?: {equal?: ValueEqualityFn<NoInfer<D>>},
): WritableSignal<D>;

/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 * This is an advanced API form where the computation has access to the previous value of the signal and the computation result.
 *
 * Note: The computation is reactive, meaning the linked signal will automatically update whenever any of the signals used within the computation change.
 *
 * @publicApi 20.0
 */
export function linkedSignal<S, D>(options: {
  source: () => S;
  computation: (source: NoInfer<S>, previous?: {source: NoInfer<S>; value: NoInfer<D>}) => D;
  equal?: ValueEqualityFn<NoInfer<D>>;
}): WritableSignal<D>;

export function linkedSignal<S, D>(
  optionsOrComputation:
    | {
        source: () => S;
        computation: ComputationFn<S, D>;
        equal?: ValueEqualityFn<D>;
      }
    | (() => D),
  options?: {equal?: ValueEqualityFn<D>},
): WritableSignal<D> {
  if (typeof optionsOrComputation === 'function') {
    const getter = createLinkedSignal<D, D>(
      optionsOrComputation,
      identityFn<D>,
      options?.equal,
    ) as LinkedSignalGetter<D, D> & WritableSignal<D>;
    return upgradeLinkedSignalGetter(getter);
  } else {
    const getter = createLinkedSignal<S, D>(
      optionsOrComputation.source,
      optionsOrComputation.computation,
      optionsOrComputation.equal,
    );
    return upgradeLinkedSignalGetter(getter);
  }
}

function upgradeLinkedSignalGetter<S, D>(getter: LinkedSignalGetter<S, D>): WritableSignal<D> {
  if (ngDevMode) {
    getter.toString = () => `[LinkedSignal: ${getter()}]`;
  }

  const node = getter[SIGNAL] as LinkedSignalNode<S, D>;
  const upgradedGetter = getter as LinkedSignalGetter<S, D> & WritableSignal<D>;

  upgradedGetter.set = (newValue: D) => linkedSignalSetFn(node, newValue);
  upgradedGetter.update = (updateFn: (value: D) => D) => linkedSignalUpdateFn(node, updateFn);
  upgradedGetter.asReadonly = signalAsReadonlyFn.bind(getter as any) as () => Signal<D>;

  return upgradedGetter;
}
