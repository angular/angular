/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {bindingUpdated} from '../bindings';
import {TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {isComponentHost} from '../interfaces/type_checks';
import {RENDERER} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {getNativeByTNode} from '../util/view_utils';
import {
  markDirtyIfOnPush,
  setAllInputsForProperty,
  setElementAttribute,
  setNgReflectProperties,
  storePropertyBindingMetadata,
} from './shared';

const ARIA_PREFIX = 'aria';

/**
 * Update an ARIA attribute by either its attribute or property name on a selected element.
 *
 * If the property name also exists as an input property on any of the element's directives, those
 * inputs will be set instead of the element property.
 *
 * @param name Name of the ARIA attribute or property (beginning with `aria`).
 * @param value New value to write.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵariaProperty<T>(name: string, value: T): typeof ɵɵariaProperty {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    const hasSetInput = setAllInputsForProperty(tNode, tView, lView, name, value);

    if (hasSetInput) {
      isComponentHost(tNode) && markDirtyIfOnPush(lView, tNode.index);
      ngDevMode && setNgReflectProperties(lView, tView, tNode, name, value);
    } else {
      ngDevMode && assertTNodeType(tNode, TNodeType.Element);
      const element = getNativeByTNode(tNode, lView) as RElement;
      const attributeName = ariaAttrName(name);
      setElementAttribute(lView[RENDERER], element, null, tNode.value, attributeName, value, null);
    }

    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, name, bindingIndex);
  }
  return ɵɵariaProperty;
}

/**
 * Converts an ARIA property name to its corresponding attribute name, if necessary.
 *
 * For example, converts `ariaLabel` to `aria-label`.
 *
 * https://www.w3.org/TR/wai-aria-1.2/#accessibilityroleandproperties-correspondence
 */
function ariaAttrName(name: string): string {
  return name.charAt(ARIA_PREFIX.length) !== '-'
    ? ARIA_PREFIX + '-' + name.slice(ARIA_PREFIX.length).toLowerCase()
    : name; // Property already has attribute name.
}
