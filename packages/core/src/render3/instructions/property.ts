/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {bindingUpdated} from '../bindings';
import {TNode} from '../interfaces/node';
import {SanitizerFn} from '../interfaces/sanitization';
import {LView, RENDERER, TView} from '../interfaces/view';
import {getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';

import {
  setPropertyAndInputs,
  setAllInputsForProperty,
  storePropertyBindingMetadata,
} from './shared';

/**
 * Update a property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled
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
export function ɵɵproperty<T>(
  propName: string,
  value: T,
  sanitizer?: SanitizerFn | null,
): typeof ɵɵproperty {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    setPropertyAndInputs(tNode, lView, propName, value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵproperty;
}

/**
 * Given `<div style="..." my-dir>` and `MyDir` with `@Input('style')` we need to write to
 * directive input.
 */
export function setDirectiveInputsWhichShadowsStyling(
  tView: TView,
  tNode: TNode,
  lView: LView,
  value: any,
  isClassBased: boolean,
) {
  // We support both 'class' and `className` hence the fallback.
  setAllInputsForProperty(tNode, tView, lView, isClassBased ? 'class' : 'style', value);
}
