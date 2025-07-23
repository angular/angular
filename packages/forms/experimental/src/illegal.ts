/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, InputSignal, ModelSignal, ɵSIGNAL as SIGNAL} from '@angular/core';

export function illegallyGetComponentInstance(injector: Injector): unknown {
  assertIsNodeInjector(injector);
  if (injector._tNode.directiveStart === 0 || injector._tNode.componentOffset === -1) {
    return undefined;
  }

  return injector._lView[injector._tNode.directiveStart + injector._tNode.componentOffset];
}

export function illegallySetComponentInput<T>(inputSignal: InputSignal<T>, value: T): void {
  inputSignal[SIGNAL].applyValueToInputSignal(inputSignal[SIGNAL], value);
}

export function illegallyIsSignalInput(value: unknown): value is InputSignal<unknown> {
  return isInputSignal(value);
}

export function illegallyIsModelInput(value: unknown): value is ModelSignal<unknown> {
  return isInputSignal(value) && isObject(value) && 'subscribe' in value;
}

function assertIsNodeInjector(injector: Injector): asserts injector is NgNodeInjector {
  if (!('_tNode' in injector)) {
    throw new Error('Expected a Node Injector');
  }
}

function isInputSignal(value: unknown): value is NgInputSignal {
  if (!isObject(value) || !(SIGNAL in value)) {
    return false;
  }
  const node = value[SIGNAL];
  return isObject(node) && 'applyValueToInputSignal' in node;
}

function assertIsObject(value: unknown): asserts value is Record<PropertyKey, unknown> {
  if (!isObject(value)) {
    throw new Error('Expected an object');
  }
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return (typeof value === 'object' || typeof value === 'function') && value != null;
}

interface NgNodeInjector extends Injector {
  _tNode: TNode;
  _lView: Array<unknown>;
}

interface TNode {
  directiveStart: number;
  componentOffset: number;
}

interface NgInputSignal {
  [SIGNAL]: NgInputSignalNode;
}

interface NgInputSignalNode {
  applyValueToInputSignal(node: NgInputSignalNode, value: unknown): void;
}
