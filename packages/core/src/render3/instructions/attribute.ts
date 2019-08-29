/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SanitizerFn} from '../interfaces/sanitization';
import {getLView, getSelectedIndex} from '../state';
import {NO_CHANGE} from '../tokens';

import {bind} from './property';
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
  const index = getSelectedIndex();
  const lView = getLView();
  const bound = bind(lView, value);
  if (bound !== NO_CHANGE) {
    elementAttributeInternal(index, name, bound, lView, sanitizer, namespace);
  }
  return ɵɵattribute;
}
