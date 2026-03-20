/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {installDevToolsSignalFormatter} from './src/formatter';

export {ComputedNode, createComputed} from './src/computed';
export {
  ComputationFn,
  LinkedSignalNode,
  LinkedSignalGetter,
  PreviousValue,
  createLinkedSignal,
  linkedSignalSetFn,
  linkedSignalUpdateFn,
} from './src/linked_signal';
export {ValueEqualityFn, defaultEquals} from './src/equality';
export {setThrowInvalidWriteToSignalError} from './src/errors';
export {
  REACTIVE_NODE,
  Reactive,
  ReactiveHookFn,
  ReactiveNode,
  ReactiveNodeKind,
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
  Version,
} from './src/graph';
export {
  SIGNAL_NODE,
  SignalGetter,
  SignalNode,
  createSignal,
  runPostSignalSetFn,
  setPostSignalSetFn,
  signalGetFn,
  signalSetFn,
  signalUpdateFn,
} from './src/signal';
export {Watch, WatchCleanupFn, WatchCleanupRegisterFn, createWatch} from './src/watch';
export {setAlternateWeakRefImpl} from './src/weak_ref';
export {untracked} from './src/untracked';
export {runEffect, BASE_EFFECT_NODE, BaseEffectNode} from './src/effect';
export {installDevToolsSignalFormatter} from './src/formatter';

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean | undefined;

// We're using a top-level access to enable signal formatting whenever the signals package is loaded.
// ngDevMode might not have been init correctly yet, checking for `undefined` ensures that in case
// it is not defined yet, we still install the formatter.
if (typeof ngDevMode === 'undefined' || ngDevMode) {
  // tslint:disable-next-line: no-toplevel-property-access
  installDevToolsSignalFormatter();
}
