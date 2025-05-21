/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {bindingUpdated} from '../bindings';
import {SanitizerFn} from '../interfaces/sanitization';
import {getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {elementAttributeInternal, storePropertyBindingMetadata} from './shared';

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
  name: string,
  value: any,
  sanitizer?: SanitizerFn | null,
  namespace?: string,
): typeof ɵɵattribute {
  const bindingIndex = nextBindingIndex();

  // Value can be `NO_CHANGE` in case of an interpolation.
  if (value !== NO_CHANGE) {
    const lView = getLView();
    if (bindingUpdated(lView, bindingIndex, value)) {
      const tView = getTView();
      const tNode = getSelectedTNode();
      elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace);
      ngDevMode && storePropertyBindingMetadata(tView.data, tNode, 'attr.' + name, bindingIndex);
    }
  }

  return ɵɵattribute;
}
