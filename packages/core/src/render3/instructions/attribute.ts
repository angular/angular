/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {bindingUpdated} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {BINDING_INDEX} from '../interfaces/view';
import {getLView, getSelectedIndex} from '../state';

import {TsickleIssue1009, elementAttributeInternal} from './shared';



/**
 * Updates the value of or removes a bound attribute on an Element.
 *
 * Used in the case of `[attr.title]="value"`
 *
 * @param name name The name of the attribute.
 * @param value value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 * @param sanitizer An optional function used to sanitize the value.
 * @param namespace Optional namespace to use when setting the attribute.
 *
 * @codeGenApi
 */
export function ɵɵattribute(
    name: string, value: any, sanitizer?: SanitizerFn | null,
    namespace?: string): TsickleIssue1009 {
  const lView = getLView();
  if (bindingUpdated(lView, lView[BINDING_INDEX]++, value)) {
    elementAttributeInternal(getSelectedIndex(), name, value, lView, sanitizer, namespace);
  }
  return ɵɵattribute;
}
