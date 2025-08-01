/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Signal} from '../api';
import type {WritableSignal} from '../signal';
import {untracked} from '../untracked';

import {
  ERRORED,
  producerAccessed,
  producerUpdateValueVersion,
  type ReactiveNode,
  runPostProducerCreatedFn,
  SIGNAL,
} from '../../../../primitives/signals';

import {DEEP_SIGNAL_NODE, type DeepSignalNode} from './internal';

export interface StructuralSignalOptions {
  debugName?: string;
}

export function structuralSignal<T>(
  parent: WritableSignal<T>,
  options?: StructuralSignalOptions,
): Signal<T> {
  // Create our `DEEP_SIGNAL_NODE` and initialize it.
  const node: DeepSignalNode = Object.create(DEEP_SIGNAL_NODE);
  node.parentNode = parent[SIGNAL] as ReactiveNode;
  if (options?.debugName) {
    node.debugName = options.debugName;
  }

  // For `structuralSignal`, we want our computation to reactively track `parent`, so changes in
  // `parent` attempt to trigger this signal (subject to `DEEP_SIGNAL_NODE`'s short-circuiting).
  //
  // However, we do _not_ want to cache the value of `parent` in `node.value`. A `structuralSignal`
  // might never update after its initial notification, and we don't want to retain a reference to
  // the original value of `parent` forever.
  //
  // Therefore, we use a clever trick: we read `parent` from our computation but don't return it,
  // instead returning a new empty object. Then, in the actual signal getter, we return an untracked
  // read of `parent` instead of `node.value`. This lets us still make the `structuralSignal` return
  // the current value of `parent` always, but only ever notify if that value is potentially
  // structurally changed.
  node.computation = () => {
    parent();
    return {};
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

    return untracked(parent);
  }) as Signal<T>;
  getter[SIGNAL] = node;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    const debugName = node.debugName ? ' (' + node.debugName + ')' : '';
    getter.toString = () => `[StructuralSignal${debugName}: ${node.value}]`;
  }

  runPostProducerCreatedFn(node);

  return getter;
}
