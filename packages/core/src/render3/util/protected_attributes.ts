/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {TNode} from '../interfaces/node';
import type {RElement} from '../interfaces/renderer_dom';
import {HYDRATION, type LView} from '../interfaces/view';

/**
 * This represents a mapping of element tag name to an attribute name that should not be reset
 * during hydration in case the value is the same.
 * Values are implemented as a list in case they need to be expanded in the future to accommodate
 * more cases.
 */
const hydrationProtectedElementToAttributeMap = new Map<string, string>([
  // All these elements and their attributes force the browser to reload resources when they're set
  // again with the same value. For example, consider an `<object>` element with its `data`
  // attribute set to `/assets/some-file.pdf`. When the browser retrieves an HTML document from the
  // server and finishes parsing it (after the document state is set to `complete`), it loads
  // external resources such as images, videos, audios, etc. This includes loading
  // `/assets/some-file.pdf`. Subsequently, when Angular begins its hydration process, it attempts
  // to call `setAttribute` on the `<object>` element again with `setAttribute('data',
  // '/assets/some-file.pdf')`. This action forces the browser to reload the same resources, even
  // though they have already been loaded previously.
  ['iframe', 'src'],
  ['embed', 'src'],
  ['object', 'data'],
]);

export function getHydrationProtectedAttribute(tagName: string): string | undefined {
  return hydrationProtectedElementToAttributeMap.get(
    // Convert to lowercase so we cover both cases when the tag name is `iframe` or `IFRAME`.
    tagName.toLowerCase(),
  );
}

/**
 * Having another function that executes every time an attribute
 * or property is set might have affected performance. However, this
 * function is guarded with the `isFirstPass` condition, which means it's
 * only executed once during the initial render (creation mode).
 * @param lView the LView of the current TNode
 * @param tNode for which we check whether its element is hydration protected
 * @param element for which we check whether it has protected attributes
 * @param attributeValue the attribute value to check whether it's already set on the element
 */
export function shouldProtectAttribute(
  lView: LView,
  tNode: TNode,
  element: RElement,
  attributeValue: any,
): boolean {
  const protectedAttributes = lView[HYDRATION]?.protectedAttributes;
  const nodeIndex = tNode?.index;

  if (
    nodeIndex != null &&
    getHydrationProtectedAttribute(element.tagName) &&
    protectedAttributes?.has(nodeIndex)
  ) {
    const protectedAttributeValue = protectedAttributes.get(nodeIndex)!;
    if (attributeValue === protectedAttributeValue) {
      protectedAttributes.delete(nodeIndex);
      return true;
    }
  }

  return false;
}
