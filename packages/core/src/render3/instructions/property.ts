/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {bindingUpdated} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {BINDING_INDEX, TVIEW} from '../interfaces/view';
import {getLView, getSelectedIndex} from '../state';

import {TsickleIssue1009, elementPropertyInternal, storePropertyBindingMetadata} from './shared';


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
    propName: string, value: T, sanitizer?: SanitizerFn | null): TsickleIssue1009 {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX]++;
  if (bindingUpdated(lView, bindingIndex, value)) {
    const nodeIndex = getSelectedIndex();
    elementPropertyInternal(lView, nodeIndex, propName, value, sanitizer);
    ngDevMode && storePropertyBindingMetadata(lView[TVIEW].data, nodeIndex, propName, bindingIndex);
  }
  return ɵɵproperty;
}
