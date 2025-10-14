/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {createComputed} from './src/computed';
export {createLinkedSignal, linkedSignalSetFn, linkedSignalUpdateFn} from './src/linked_signal';
export {defaultEquals} from './src/equality';
export {setThrowInvalidWriteToSignalError} from './src/errors';
export {
  REACTIVE_NODE,
  SIGNAL,
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerMarkDirty,
  consumerPollProducersForChange,
  finalizeConsumerAfterComputation,
  getActiveConsumer,
  isInNotificationPhase,
  isReactive,
  producerAccessed,
  producerIncrementEpoch,
  producerMarkClean,
  producerNotifyConsumers,
  producerUpdateValueVersion,
  producerUpdatesAllowed,
  resetConsumerBeforeComputation,
  runPostProducerCreatedFn,
  setActiveConsumer,
  setPostProducerCreatedFn,
} from './src/graph';
export {
  SIGNAL_NODE,
  createSignal,
  runPostSignalSetFn,
  setPostSignalSetFn,
  signalGetFn,
  signalSetFn,
  signalUpdateFn,
} from './src/signal';
export {createWatch} from './src/watch';
export {setAlternateWeakRefImpl} from './src/weak_ref';
export {untracked} from './src/untracked';
export {runEffect, BASE_EFFECT_NODE} from './src/effect';
//# sourceMappingURL=index.js.map
