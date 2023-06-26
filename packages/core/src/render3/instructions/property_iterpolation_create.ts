/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed} from '../../signals';
import {assertDefined, assertIndexInRange} from '../../util/assert';
import {EMPTY_ARRAY} from '../../util/empty';
import {DirectiveDef} from '../interfaces/definition';
import {PropertyAliasValue, TNode} from '../interfaces/node';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponentHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, RENDERER, TVIEW} from '../interfaces/view';
import {getCurrentTNode, getLView, getSelectedTNode, getTView} from '../state';
import {NO_CHANGE} from '../tokens';
import {renderStringify} from '../util/stringify_utils';

import {interpolationV} from './interpolation';
import {determineInputTargets} from './property_create_shared';
import {elementPropertyInternal, markDirtyIfOnPush, writeToDirectiveInput} from './shared';


function concatenateInterpolatedValue(values: any[]): string {
  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += renderStringify(values[i]) + values[i + 1];
  }

  return content;
}

/**
 * TODO
 *
 * @codeGenApi
 */
export function ɵɵpropertyInterpolateVCreate(
    slot: number, propName: string, staticParts: string[], values: any[],
    sanitizer?: SanitizerFn|null): typeof ɵɵpropertyInterpolateVCreate {
  const lView = getLView();
  const expressionsSlot = HEADER_OFFSET + slot;

  const tView = getTView();
  const tNode = getCurrentTNode();
  assertDefined(tNode, `propertyCreate() must follow an actual element`);

  const inputData = tNode.inputs?.[propName] ?? EMPTY_ARRAY;
  const {zoneTargets, signalInputs} = determineInputTargets(inputData, tView, lView);

  // If there are multiple signal targets, or any zone targets, then wrap `expr` in a computed. This
  // ensures that the interpolated string is concatenated only once.
  let exprValueComputed: (() => string)|null = null;
  if (zoneTargets.length > 0 || signalInputs.length > 1) {
    exprValueComputed = computed(() => concatenateInterpolatedValue(values));
  }

  lView[expressionsSlot] = values;
  for (const inputSignal of signalInputs) {
    inputSignal.bindToComputation(exprValueComputed!);
  }

  if (tView.firstCreatePass) {
    if (inputData.length === 0) {
      // Untargeted input -> DOM binding.
      (tView.virtualUpdate ??= []).push({
        slot: expressionsSlot,
        instruction: () => propertyInterpolationUpdateDom(
            tNode.index, propName, expressionsSlot, sanitizer ?? null),
      });
    } else if (zoneTargets?.length ?? 0 > 0) {
      // Some binding targets were zone-based, so we need an update instruction to process them.
      (tView.virtualUpdate ??= []).push({
        slot: expressionsSlot,
        instruction: () =>
            propertyInterpolationUpdateInput(propName, expressionsSlot, zoneTargets!),
      });
    } else {
      // The only target(s) were signal-based, so no update path is needed.
    }
  }

  return ɵɵpropertyInterpolateVCreate;
}
function propertyInterpolationUpdateDom(
    nodeSlot: number, propName: string, expressionSlot: number, sanitizer: SanitizerFn|null): void {
  const lView = getLView();
  const values: any[] = lView[expressionSlot];
  const interpolatedValue = interpolationV(lView, values);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = tView.data[nodeSlot] as TNode;
    elementPropertyInternal(
        tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false,
        /* TODO(signals) */ false);

    // TODO(pk): ngDevMode part of this instruction
  }
}

export function propertyInterpolationUpdateInput(
    propName: string, expressionSlot: number, targets: PropertyAliasValue): void {
  const lView = getLView();
  const values: any[] = lView[expressionSlot];
  const interpolatedValue = interpolationV(lView, values);
  if (interpolatedValue !== NO_CHANGE) {
    // TODO(pk): inconsistent signature of update instructions
    const tNode = getSelectedTNode();
    const tView = lView[TVIEW];
    ngDevMode && assertDefined(tNode.inputs, `Expected tNode to have inputs`);

    for (let i = 0; i < targets.length;) {
      const index = targets[i++] as number;
      const privateName = targets[i++] as string;
      ngDevMode && assertIndexInRange(lView, index);
      const instance = lView[index];
      const def = tView.data[index] as DirectiveDef<any>;

      writeToDirectiveInput(def, instance, propName, privateName, interpolatedValue as string);

      if (isComponentHost(tNode)) {
        markDirtyIfOnPush(lView, tNode.index);
      }

      // TODO(pk): ngDevMode part of the inputs update
    }
  }
}
