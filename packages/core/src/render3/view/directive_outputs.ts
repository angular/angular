/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertIndexInRange} from '../../util/assert';
import {DirectiveDef} from '../interfaces/definition';
import {TNode} from '../interfaces/node';
import {CONTEXT, LView, TVIEW, TView} from '../interfaces/view';
import {getOrCreateLViewCleanup, getOrCreateTViewCleanup} from '../util/view_utils';
import {wrapListener} from './listeners';

/** Describes a subscribable output field value. */
interface SubscribableOutput<T> {
  subscribe(listener: (v: T) => void): {unsubscribe: () => void};
}

export function createOutputListener<T = unknown>(
  tNode: TNode,
  lView: LView<{} | null>,
  listenerFn: (e?: any) => any,
  targetDef: DirectiveDef<unknown>,
  eventName: string,
) {
  // TODO(pk): decouple checks from the actual binding
  const wrappedListener = wrapListener(tNode, lView, lView[CONTEXT], listenerFn);

  // TODO(pk): simplify signature of listenToDirectiveOutput
  listenToDirectiveOutput(tNode, lView[TVIEW], lView, targetDef, eventName, wrappedListener);
}

/** Listens to an output on a specific directive. */
function listenToDirectiveOutput(
  tNode: TNode,
  tView: TView,
  lView: LView,
  target: DirectiveDef<unknown>,
  eventName: string,
  listenerFn: (e?: any) => any,
): boolean {
  const tCleanup = tView.firstCreatePass ? getOrCreateTViewCleanup(tView) : null;
  const lCleanup = getOrCreateLViewCleanup(lView);
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
          tView,
          lView,
          index,
          hostDirectiveOutputs[i + 1] as string,
          eventName,
          listenerFn,
          lCleanup,
          tCleanup,
        );
      } else if (index > hostDirectivesEnd) {
        break;
      }
    }
  }

  if (target.outputs.hasOwnProperty(eventName)) {
    ngDevMode && assertIndexInRange(lView, hostIndex);
    hasOutput = true;
    listenToOutput(
      tNode,
      tView,
      lView,
      hostIndex,
      eventName,
      eventName,
      listenerFn,
      lCleanup,
      tCleanup,
    );
  }

  return hasOutput;
}

export function listenToOutput(
  tNode: TNode,
  tView: TView,
  lView: LView,
  index: number,
  lookupName: string,
  eventName: string,
  listenerFn: (e?: any) => any,
  lCleanup: any[],
  tCleanup: any[] | null,
) {
  ngDevMode && assertIndexInRange(lView, index);
  const instance = lView[index];
  const def = tView.data[index] as DirectiveDef<unknown>;
  const propertyName = def.outputs[lookupName];
  const output = instance[propertyName];

  if (ngDevMode && !isOutputSubscribable(output)) {
    throw new Error(`@Output ${propertyName} not initialized in '${instance.constructor.name}'.`);
  }

  const subscription = (output as SubscribableOutput<unknown>).subscribe(listenerFn);
  const idx = lCleanup.length;
  lCleanup.push(listenerFn, subscription);
  tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
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
