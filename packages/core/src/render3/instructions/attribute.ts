/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SanitizerFn} from '../interfaces/sanitization';
import {getSelectedIndex} from '../state';

import {ɵɵelementAttribute} from './element';
import {ɵɵbind} from './property';

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
    name: string, value: any, sanitizer?: SanitizerFn | null, namespace?: string) {
  const index = getSelectedIndex();
  // TODO(FW-1340): Refactor to remove the use of other instructions here.
  return ɵɵelementAttribute(index, name, ɵɵbind(value), sanitizer, namespace);
}
