/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Signal, WritableSignal} from '@angular/core';
import {
  ERRORED,
  producerAccessed,
  producerIncrementEpoch,
  producerMarkClean,
  producerNotifyConsumers,
  producerUpdateValueVersion,
  type ReactiveNode,
  runPostProducerCreatedFn,
  SIGNAL,
} from '@angular/core/primitives/signals';
import {DEEP_SIGNAL_NODE, type DeepSignalNode, setDeepSignalWriter} from './internal';

export function deepSignal<T extends {}, K extends keyof T>(
  parent: WritableSignal<T>,
  key: Signal<K>,
): WritableSignal<T[K]> {
  type V = T[K];

  // Create our `DEEP_SIGNAL_NODE` and initialize it.
  const node: DeepSignalNode = Object.create(DEEP_SIGNAL_NODE);
  node.propertyNode = key[SIGNAL] as ReactiveNode;
  node.parentNode = parent[SIGNAL] as ReactiveNode;
  // Our value derives from the parent's value at our specific key.
  node.computation = () => {
    // Save the key we observe here as `lastKey`. We can short circuit later notifications as long
    // as the write was not to this key.
    node.lastProperty = key();
    return parent()[node.lastProperty as K];
  };

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
    node.version++;
    producerIncrementEpoch();
    producerNotifyConsumers(node);

    const property = key();
    node.lastProperty = property;
    node.lastPropertyValueVersion = node.propertyNode!.version;

    const prevWriter = setDeepSignalWriter(node);

    try {
      parent.update((current) => {
        const property = key();
        if (isArray<T, V>(current)) {
          const newSource = [...current] as unknown as T & Array<V>;
          newSource[property as number] = value;
          return newSource as T & Array<V>;
        } else {
          return {...current, [property]: value};
        }
      });

      // Unlike normal computed nodes, deep signals handle updating their own value.
      node.value = value;
      producerMarkClean(node);
    } finally {
      setDeepSignalWriter(prevWriter);
    }
  };

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
