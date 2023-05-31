/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Sanitizer} from '../../core';
import {validateAgainstEventProperties} from '../../sanitization/sanitization';
import {assertDefined} from '../../util/assert';
import {bindingUpdated} from '../bindings';
import {handleUnknownPropertyError, isPropertyValid} from '../instructions/element_validation';
import {mapPropName} from '../instructions/shared';
import {getCurrentTNode, getLView, getTView, nextBindingIndex} from '../state';
import {getNativeByTNode} from '../util/view_utils';

import {TNode} from './node';
import {RComment, RElement} from './renderer_dom';
import {SanitizerFn} from './sanitization';
import {HEADER_OFFSET, RENDERER, TView} from './view';

export function propertyCreate(slot: number, name: string, expr: () => void): void {
  const lView = getLView();
  const tNode = getCurrentTNode();
  assertDefined(tNode, `propertyCreate() must follow an actual element`);
  const adjustedSlot = HEADER_OFFSET + slot;
  lView[adjustedSlot] = expr;

  const tView = getTView();
  if (tView.firstCreatePass) {
    (tView.virtualUpdate ??= []).push({
      slot,
      instruction: () => virtualPropertyDom(tView, tNode, adjustedSlot, name, null),
    });
  }
}

export function virtualPropertyDom(
    tView: TView, tNode: TNode, adjustedSlot: number, name: string,
    sanitizer: SanitizerFn|null): void {
  debugger;
  const lView = getLView();
  const expr = lView[adjustedSlot] as () => unknown;
  let value = expr();

  const bindingIndex = nextBindingIndex();
  if (!bindingUpdated(lView, bindingIndex, value)) {
    return;
  }

  const element = getNativeByTNode(tNode, lView) as RElement | RComment;
  name = mapPropName(name);

  if (ngDevMode) {
    validateAgainstEventProperties(name);
    if (!isPropertyValid(element, name, tNode.value, tView.schemas)) {
      handleUnknownPropertyError(name, tNode.value, tNode.type, lView);
    }
    ngDevMode.rendererSetProperty++;
  }

  // It is assumed that the sanitizer is only added when the compiler determines that the
  // property is risky, so sanitization can be done without further checks.
  value = sanitizer != null ? (sanitizer(value, tNode.value || '', name) as any) : value;
  lView[RENDERER].setProperty(element as RElement, name, value);
}
