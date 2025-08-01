/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '../untracked';
import {isSignal, type Signal} from '../api';
import {type WritableSignal, signalAsReadonlyFn} from '../signal';

import {
  ERRORED,
  producerAccessed,
  producerIncrementEpoch,
  producerMarkClean,
  producerNotifyConsumers,
  producerUpdatesAllowed,
  producerUpdateValueVersion,
  type ReactiveNode,
  runPostProducerCreatedFn,
  throwInvalidWriteToSignalError,
  SIGNAL,
  COMPUTING,
} from '../../../../primitives/signals';

import {DEEP_SIGNAL_NODE, type DeepSignalNode, setDeepSignalWriter} from './internal';

export interface DeepSignalOptions {
  debugName?: string;
}

export function deepSignal<T extends {}, K extends keyof T>(
  parent: WritableSignal<T>,
  key: K | Signal<K>,
  options?: DeepSignalOptions,
): WritableSignal<T[K]> {
  type V = T[K];

  let keySignal: Signal<K> | undefined;

  // Create our `DEEP_SIGNAL_NODE` and initialize it.
  const node: DeepSignalNode = Object.create(DEEP_SIGNAL_NODE);
  if (isSignal(key)) {
    keySignal = key;
    node.propertyNode = keySignal[SIGNAL] as ReactiveNode;
  } else {
    node.lastProperty = key;
  }

  node.parentNode = parent[SIGNAL] as ReactiveNode;
  // Our value derives from the parent's value at our specific key.
  node.computation = () => {
    // Save the key we observe here as `lastKey`. We can short circuit later notifications as long
    // as the write was not to this key.
    if (keySignal) {
      node.lastProperty = keySignal();
      node.lastPropertyValueVersion = node.propertyNode!.version;
    }

    return parent()[node.lastProperty as K];
  };
  if (options?.debugName) {
    node.debugName = options.debugName;
  }

  // Next define the signal getter, which uses the same flow as `computed`.
  const getter = (() => {
    // Check if the value needs updating before returning it.
    producerUpdateValueVersion(node);

    // Record that someone looked at this signal.
    producerAccessed(node);

    if (node.value === ERRORED) {
      throw node.error;
    }

    return node.value;
  }) as WritableSignal<V>;
  getter[SIGNAL] = node;

  // The deep signal specific write path.
  getter.set = (value: V) => {
    if (!producerUpdatesAllowed()) {
      throwInvalidWriteToSignalError(node);
    }

    if (node.equal(node.value, value)) {
      return;
    }

    node.version++;
    // We record a value of `COMPUTING` during the write to the parent, in case somehow the parent
    // depends on us.
    node.value = COMPUTING;

    // Temporarily mark ourselves dirty during the write. Later on, we'll mark ourselves clean.
    // This prevents the notification when we write to our parent from marking our children dirty.
    node.rawDirty = true;

    producerIncrementEpoch();
    producerNotifyConsumers(node);

    // Update the name of the property we're writing to, if it's reactive.
    if (keySignal) {
      node.lastProperty = untracked(keySignal);
      node.lastPropertyValueVersion = node.propertyNode!.version;
    }

    const current = untracked(parent);

    // We make one concession to `structuralSignal` here: if we're adding a property that does not
    // exist, we don't use the `deepSignal` write path. This ensures any `structuralSignal`s will
    // get notified of this change.
    let prevWriter: DeepSignalNode | null;
    if ((node.lastProperty as K) in current) {
      prevWriter = setDeepSignalWriter(node);
    } else {
      prevWriter = setDeepSignalWriter(null);
    }

    try {
      if (isArray<T, V>(current)) {
        const newSource = [...current] as unknown as T & Array<V>;
        newSource[node.lastProperty as number] = value;
        parent.set(newSource);
      } else {
        parent.set({...current, [node.lastProperty as K]: value});
      }
      // TODO: today, `postSignalSetFn` happens when the top-most `parent` in a write path of
      // `deepSignal`s is updated. We probably want to delay that until we come back up the stack
      // and finish the write path of every `deepSignal` along the way (marking clean, etc).

      // Unlike normal computed nodes, deep signals handle updating their own value. Therefore, once
      // we set the value we can consider ourselves clean. We could set our value earlier.
      node.value = value;
      producerMarkClean(node);
    } finally {
      setDeepSignalWriter(prevWriter);
    }
  };

  getter.update = (fn: (value: V) => V): void => {
    getter.set(fn(untracked(getter)));
  };

  getter.asReadonly = signalAsReadonlyFn;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const debugName = node.debugName ? ' (' + node.debugName + ')' : '';
    getter.toString = () => `[DeepSignal${debugName}: ${node.value}]`;
  }

  runPostProducerCreatedFn(node);
  return getter;
}

function isArray<T extends {}, V>(value: T): value is T & Array<V> {
  return Array.isArray(value);
}
