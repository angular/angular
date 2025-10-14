/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../../errors';
import {assertIndexInRange} from '../../util/assert';
import {TVIEW} from '../interfaces/view';
import {stringifyForError} from '../util/stringify_utils';
import {storeListenerCleanup, wrapListener} from './listeners';
export function createOutputListener(tNode, lView, listenerFn, targetDef, eventName) {
  // TODO(pk): decouple checks from the actual binding
  const wrappedListener = wrapListener(tNode, lView, listenerFn);
  const hasBound = listenToDirectiveOutput(tNode, lView, targetDef, eventName, wrappedListener);
  if (!hasBound && ngDevMode) {
    throw new RuntimeError(
      316 /* RuntimeErrorCode.INVALID_BINDING_TARGET */,
      `${stringifyForError(targetDef.type)} does not have an output with a public name of "${eventName}".`,
    );
  }
}
/** Listens to an output on a specific directive. */
function listenToDirectiveOutput(tNode, lView, target, eventName, listenerFn) {
  let hostIndex = null;
  let hostDirectivesStart = null;
  let hostDirectivesEnd = null;
  let hasOutput = false;
  if (ngDevMode && !tNode.directiveToIndex?.has(target.type)) {
    throw new Error(`Node does not have a directive with type ${target.type.name}`);
  }
  const data = tNode.directiveToIndex.get(target.type);
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
      const index = hostDirectiveOutputs[i];
      if (index >= hostDirectivesStart && index <= hostDirectivesEnd) {
        ngDevMode && assertIndexInRange(lView, index);
        hasOutput = true;
        listenToOutput(tNode, lView, index, hostDirectiveOutputs[i + 1], eventName, listenerFn);
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
export function listenToOutput(tNode, lView, directiveIndex, lookupName, eventName, listenerFn) {
  ngDevMode && assertIndexInRange(lView, directiveIndex);
  const instance = lView[directiveIndex];
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex];
  const propertyName = def.outputs[lookupName];
  const output = instance[propertyName];
  if (ngDevMode && !isOutputSubscribable(output)) {
    throw new Error(`@Output ${propertyName} not initialized in '${instance.constructor.name}'.`);
  }
  const subscription = output.subscribe(listenerFn);
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}
/**
 * Whether the given value represents a subscribable output.
 *
 * For example, an `EventEmitter, a `Subject`, an `Observable` or an
 * `OutputEmitter`.
 */
function isOutputSubscribable(value) {
  return value != null && typeof value.subscribe === 'function';
}
//# sourceMappingURL=directive_outputs.js.map
