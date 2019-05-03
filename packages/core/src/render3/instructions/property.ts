/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertNotEqual} from '../../util/assert';
import {bindingUpdated} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {BINDING_INDEX} from '../interfaces/view';
import {getLView, getSelectedIndex} from '../state';
import {NO_CHANGE} from '../tokens';

import {TsickleIssue1009, elementPropertyInternal, loadComponentRenderer, storeBindingMetadata} from './shared';


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
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 * @returns This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
export function ɵɵproperty<T>(
    propName: string, value: T, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean): TsickleIssue1009 {
  const index = getSelectedIndex();
  ngDevMode && assertNotEqual(index, -1, 'selected index cannot be -1');
  const bindReconciledValue = ɵɵbind(value);
  if (bindReconciledValue !== NO_CHANGE) {
    elementPropertyInternal(index, propName, bindReconciledValue, sanitizer, nativeOnly);
  }
  return ɵɵproperty;
}

/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 *
 * @codeGenApi
 */
export function ɵɵbind<T>(value: T): T|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX]++;
  storeBindingMetadata(lView);
  return bindingUpdated(lView, bindingIndex, value) ? value : NO_CHANGE;
}

/**
* **TODO: Remove this function after `property` is in use**
* Update a property on an element.
*
* If the property name also exists as an input property on one of the element's directives,
* the component property will be set instead of the element property. This check must
* be conducted at runtime so child components that add new @Inputs don't have to be re-compiled.
*
* @param index The index of the element to update in the data array
* @param propName Name of property. Because it is going to DOM, this is not subject to
*        renaming as part of minification.
* @param value New value to write.
* @param sanitizer An optional function used to sanitize the value.
* @param nativeOnly Whether or not we should only set native properties and skip input check
* (this is necessary for host property bindings)
 *
 * @codeGenApi
*/
export function ɵɵelementProperty<T>(
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean): void {
  if (value !== NO_CHANGE) {
    elementPropertyInternal(index, propName, value, sanitizer, nativeOnly);
  }
}

/**
 * Updates a synthetic host binding (e.g. `[@foo]`) on a component.
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
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 *
 * @codeGenApi
 */
export function ɵɵcomponentHostSyntheticProperty<T>(
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean) {
  if (value !== NO_CHANGE) {
    elementPropertyInternal(index, propName, value, sanitizer, nativeOnly, loadComponentRenderer);
  }
}
