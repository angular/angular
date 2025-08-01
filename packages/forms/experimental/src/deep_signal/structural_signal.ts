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
  producerUpdateValueVersion,
  type ReactiveNode,
  runPostProducerCreatedFn,
  SIGNAL,
} from '@angular/core/primitives/signals';
import {DEEP_SIGNAL_NODE, type DeepSignalNode} from './internal';

export function structuralSignal<T>(parent: WritableSignal<T>): Signal<T> {
  // Create our `DEEP_SIGNAL_NODE` and initialize it.
  const node: DeepSignalNode = Object.create(DEEP_SIGNAL_NODE);
  node.parentNode = parent[SIGNAL] as ReactiveNode;
  node.computation = parent;

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
  }) as Signal<T>;
  getter[SIGNAL] = node;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const debugName = node.debugName ? ' (' + node.debugName + ')' : '';
    getter.toString = () => `[StructuralSignal${debugName}: ${node.value}]`;
  }

  runPostProducerCreatedFn(node);

  return getter;
}
