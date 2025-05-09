/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import type {EventCallback, WrappedEventCallback} from '../../event_delegation_utils';
import {assertIndexInRange} from '../../util/assert';
import {DirectiveDef} from '../interfaces/definition';
import {TNode} from '../interfaces/node';
import {LView, TVIEW} from '../interfaces/view';
import {stringifyForError} from '../util/stringify_utils';
import {storeListenerCleanup, wrapListener} from './listeners';

/** Describes a subscribable output field value. */
interface SubscribableOutput<T> {
  subscribe(listener: (v: T) => void): {
    unsubscribe: () => void;
  };
}

export function createOutputListener(
  tNode: TNode,
  lView: LView<{} | null>,
  listenerFn: EventCallback,
  targetDef: DirectiveDef<unknown>,
  eventName: string,
) {
  // TODO(pk): decouple checks from the actual binding
  const wrappedListener = wrapListener(tNode, lView, listenerFn);
  const hasBound = listenToDirectiveOutput(tNode, lView, targetDef, eventName, wrappedListener);

  if (!hasBound && ngDevMode) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_BINDING_TARGET,
      `${stringifyForError(targetDef.type)} does not have an output with a public name of "${eventName}".`,
    );
  }
}

/** Listens to an output on a specific directive. */
function listenToDirectiveOutput(
  tNode: TNode,
  lView: LView,
  target: DirectiveDef<unknown>,
  eventName: string,
  listenerFn: WrappedEventCallback,
): boolean {
  let hostIndex: number | null = null;
  let hostDirectivesStart: number | null = null;
  let hostDirectivesEnd: number | null = null;
  let hasOutput = false;

  if (ngDevMode && !tNode.directiveToIndex?.has(target.type)) {
    throw new Error(`Node does not have a directive with type ${target.type.name}`);
  }

  const data = tNode.directiveToIndex!.get(target.type)!;

  if (typeof data === 'number') {
    hostIndex = data;
  } else {
    [hostIndex, hostDirectivesStart, hostDirectivesEnd] = data;
  }

  if (
    hostDirectivesStart !== null &&
    hostDirectivesEnd !== null &&
    tNode.hostDirectiveOutputs?.hasOwnProperty(eventName)
  ) {
    const hostDirectiveOutputs = tNode.hostDirectiveOutputs[eventName];

    for (let i = 0; i < hostDirectiveOutputs.length; i += 2) {
      const index = hostDirectiveOutputs[i] as number;

      if (index >= hostDirectivesStart && index <= hostDirectivesEnd) {
        ngDevMode && assertIndexInRange(lView, index);
        hasOutput = true;
        listenToOutput(
          tNode,
          lView,
          index,
          hostDirectiveOutputs[i + 1] as string,
          eventName,
          listenerFn,
        );
      } else if (index > hostDirectivesEnd) {
        break;
      }
    }
  }

  if (target.outputs.hasOwnProperty(eventName)) {
    ngDevMode && assertIndexInRange(lView, hostIndex);
    hasOutput = true;
    listenToOutput(tNode, lView, hostIndex, eventName, eventName, listenerFn);
  }

  return hasOutput;
}

export function listenToOutput(
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  lookupName: string,
  eventName: string,
  listenerFn: WrappedEventCallback,
) {
  ngDevMode && assertIndexInRange(lView, directiveIndex);
  const instance = lView[directiveIndex];
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex] as DirectiveDef<unknown>;
  const propertyName = def.outputs[lookupName];
  const output = instance[propertyName];

  if (ngDevMode && !isOutputSubscribable(output)) {
    throw new Error(`@Output ${propertyName} not initialized in '${instance.constructor.name}'.`);
  }

  const subscription = (output as SubscribableOutput<unknown>).subscribe(listenerFn);
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}

/**
 * Whether the given value represents a subscribable output.
 *
 * For example, an `EventEmitter, a `Subject`, an `Observable` or an
 * `OutputEmitter`.
 */
function isOutputSubscribable(value: unknown): value is SubscribableOutput<unknown> {
  return (
    value != null && typeof (value as Partial<SubscribableOutput<unknown>>).subscribe === 'function'
  );
}
