/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {bindingUpdated} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {RENDERER} from '../interfaces/view';
import {getCurrentDirectiveDef, getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';

import {elementPropertyInternal, loadComponentRenderer, storePropertyBindingMetadata} from './shared';

/**
 * Update a property on a host element. Only applies to native node properties, not inputs.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
export function ɵɵhostProperty<T>(
    propName: string, value: T, sanitizer?: SanitizerFn|null): typeof ɵɵhostProperty {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, value, lView[RENDERER], sanitizer, true);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵhostProperty;
}


/**
 * Updates a synthetic host binding (e.g. `[@foo]`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host binding (e.g. `@HostBinding('@foo')`) properly gets rendered in
 * the component's renderer. Normally all host bindings are evaluated with the parent
 * component's renderer, but, in the case of animation @triggers, they need to be
 * evaluated with the sub component's renderer (because that's where the animation
 * triggers are defined).
 *
 * Do not use this instruction as a replacement for `elementProperty`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 *
 * @codeGenApi
 */
export function ɵɵsyntheticHostProperty<T>(
    propName: string, value: T|NO_CHANGE,
    sanitizer?: SanitizerFn|null): typeof ɵɵsyntheticHostProperty {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    const currentDef = getCurrentDirectiveDef(tView.data);
    const renderer = loadComponentRenderer(currentDef, tNode, lView);
    elementPropertyInternal(tView, tNode, lView, propName, value, renderer, sanitizer, true);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵsyntheticHostProperty;
}
