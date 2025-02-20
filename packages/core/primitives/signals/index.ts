/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {getActiveConsumer, setActiveConsumer, Consumer} from './src/interop_lib';
export {ComputedNode, createComputed} from './src/computed';
export {
  ComputationFn,
  LinkedSignalNode,
  LinkedSignalGetter,
  createLinkedSignal,
  linkedSignalSetFn,
  linkedSignalUpdateFn,
} from './src/linked_signal';
export {ValueEqualityFn, defaultEquals} from './src/equality';
export {setThrowInvalidWriteToSignalError} from './src/errors';
export {
  REACTIVE_NODE,
  Reactive,
  ReactiveNode,
  SIGNAL,
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerMarkDirty,
  consumerPollProducersForChange,
  isInNotificationPhase,
  isReactive,
  producerAccessed,
  producerIncrementEpoch,
  producerMarkClean,
  producerNotifyConsumers,
  producerUpdateValueVersion,
  producerUpdatesAllowed,
} from './src/graph';
export {
  SIGNAL_NODE,
  SignalGetter,
  SignalNode,
  createSignal,
  runPostSignalSetFn,
  setPostSignalSetFn,
  signalSetFn,
  signalUpdateFn,
} from './src/signal';
export {Watch, WatchCleanupFn, WatchCleanupRegisterFn, createWatch} from './src/watch';
export {setAlternateWeakRefImpl} from './src/weak_ref';
export {untracked} from './src/untracked';
export {PRODUCER_NODE, CONSUMER_NODE} from './src/interop';
