/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computed} from '../../signals';
import {assertDefined} from '../../util/assert';
import {EMPTY_ARRAY} from '../../util/empty';
import {SanitizerFn} from '../interfaces/sanitization';
import {HEADER_OFFSET} from '../interfaces/view';
import {getCurrentTNode, getLView, getTView} from '../state';

import {determineInputTargets, propertyUpdateDom, propertyUpdateInput} from './property_create_shared';

/**
 * TODO
 *
 * @codeGenApi
 */
export function ɵɵpropertyCreate<T>(
    slot: number, propName: string, expr: () => T,
    sanitizer?: SanitizerFn|null): typeof ɵɵpropertyCreate {
  const lView = getLView();
  const expressionSlot = HEADER_OFFSET + slot;

  const tView = getTView();
  const tNode = getCurrentTNode();
  assertDefined(tNode, `propertyCreate() must follow an actual element`);

  const inputData = tNode.inputs?.[propName] ?? EMPTY_ARRAY;
  const {zoneTargets, signalInputs} = determineInputTargets(inputData, tView, lView);

  // If there are multiple signal targets, or any zone targets, then wrap `expr` in a computed. This
  // ensures that the expression is only evaluated once, even if it has multiple consumers. Zone
  // targets always use a computed as this memoizes all object/literal creation (which would
  // otherwise have used pure functions).
  if (zoneTargets.length > 0 || signalInputs.length > 1) {
    expr = computed(expr);
  }

  lView[expressionSlot] = expr;
  for (const inputSignal of signalInputs) {
    inputSignal.bindToComputation(expr);
  }

  if (tView.firstCreatePass) {
    if (inputData.length === 0) {
      // Untargeted input -> DOM binding.
      (tView.virtualUpdate ??= []).push({
        slot: expressionSlot,
        instruction: () =>
            propertyUpdateDom(tNode.index, propName, expressionSlot, sanitizer ?? null),
      });
    } else if (zoneTargets?.length ?? 0 > 0) {
      // Some binding targets were zone-based, so we need an update instruction to process them.
      (tView.virtualUpdate ??= []).push({
        slot: expressionSlot,
        instruction: () => propertyUpdateInput(propName, expressionSlot, zoneTargets!),
      });
    } else {
      // The only target(s) were signal-based, so no update path is needed.
    }
  }

  return ɵɵpropertyCreate;
}
