/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computed, WritableSignal} from '../../signals';
import {assertDefined, assertIndexInRange} from '../../util/assert';
import {DirectiveDef} from '../interfaces/definition';
import {PropertyAliases} from '../interfaces/node';
import {SanitizerFn} from '../interfaces/sanitization';
import {HEADER_OFFSET} from '../interfaces/view';
import {effect} from '../reactivity/effect';
import {getCurrentTNode, getLView, getTView} from '../state';
import {getTNode} from '../util/view_utils';

import {ɵɵproperty} from './property';
import {analyzePropertyForElement, TargetType} from './shared_property_analysis';

/**
 * TODO
 *
 * @codeGenApi
 */
export function ɵɵpropertyCreate<T>(
    slot: number, propName: string, expr: () => T,
    sanitizer?: SanitizerFn|null): typeof ɵɵpropertyCreate {
  const tView = getTView();
  if (!tView.firstCreatePass) {
    return ɵɵpropertyCreate;
  }

  const lView = getLView();
  const tNode = getCurrentTNode();
  assertDefined(tNode, `propertyCreate() must follow an actual element`);

  const propTarget = analyzePropertyForElement(tNode, propName);
  let exprComputed: (() => any)|null = null;

  let hasZoneOrDomBindings = propTarget?.kind === TargetType.DomBinding;

  if (propTarget?.kind === TargetType.Input) {
    const inputData = propTarget.data;
    for (let i = 0; i < inputData.length;) {
      const index = inputData[i++] as number;
      const privateName = inputData[i++] as string;
      const instance = lView[index];
      ngDevMode && assertIndexInRange(lView, index);
      const def = tView.data[index] as DirectiveDef<any>;

      if (def.signals) {
        exprComputed ??= computed(expr);
        const inputSignal = (instance[privateName] as WritableSignal<any>);
        instance[privateName] = exprComputed;

        // Notify that the input has changed... This is a hack
        // because we don't have `InputSignal` yet.
        // TODO(signals)
        inputSignal.mutate(() => {});
      } else {
        // Found a Zone input. Needs to be set via virtual instruction.
        hasZoneOrDomBindings = true;
      }
    }
  }

  const expressionSlot = HEADER_OFFSET + slot;
  lView[expressionSlot] = expr;

  if (hasZoneOrDomBindings && tView.firstCreatePass) {
    (tView.virtualUpdate ??= []).push({
      slot,
      instruction: () => {
        // Note: Cannot use `lView` from outer scope because the virtual instruction
        // here is re-used in multiple instances of the same `tView`.
        const lView = getLView();
        const expr = lView[expressionSlot];

        // Invoke Zone property instruction. It will:
        //  - handle Zone targets
        //  - DOM bindings
        ɵɵproperty(propName, expr(), sanitizer, {skipSignal: true});
      },
    })
  }

  // TODO virtual instruction
  return ɵɵpropertyCreate;
}
