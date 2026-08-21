/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {installDevToolsSignalFormatter} from './src/formatter';

export {ComputedNode, createComputed} from './src/computed';
export {BASE_EFFECT_NODE, BaseEffectNode, runEffect} from './src/effect';
export {defaultEquals, ValueEqualityFn} from './src/equality';
export {setThrowInvalidWriteToSignalError} from './src/errors';
export {installDevToolsSignalFormatter} from './src/formatter';
export {
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
  producerUpdatesAllowed,
  producerUpdateValueVersion,
  Reactive,
  REACTIVE_NODE,
  ReactiveHookFn,
  ReactiveNode,
  ReactiveNodeKind,
  resetConsumerBeforeComputation,
  runPostProducerCreatedFn,
  setActiveConsumer,
  setPostProducerCreatedFn,
  SIGNAL,
  Version,
} from './src/graph';
export {
  ComputationFn,
  createLinkedSignal,
  LinkedSignalGetter,
  LinkedSignalNode,
  linkedSignalSetFn,
  linkedSignalUpdateFn,
  PreviousValue,
} from './src/linked_signal';
export {
  createSignal,
  runPostSignalSetFn,
  setPostSignalSetFn,
  SIGNAL_NODE,
  signalGetFn,
  SignalGetter,
  SignalNode,
  signalSetFn,
  signalUpdateFn,
} from './src/signal';
export {untracked} from './src/untracked';
export {setAlternateWeakRefImpl} from './src/weak_ref';

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
