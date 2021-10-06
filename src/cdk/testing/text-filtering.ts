/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Gets text of element excluding certain selectors within the element.
 * @param element Element to get text from,
 * @param excludeSelector Selector identifying which elements to exclude,
 */
export function _getTextWithExcludedElements(element: Element, excludeSelector: string) {
  const clone = element.cloneNode(true) as Element;
  const exclusions = clone.querySelectorAll(excludeSelector);
  for (let i = 0; i < exclusions.length; i++) {
    exclusions[i].remove();
  }
  return (clone.textContent || '').trim();
}
