/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** IDs are delimited by an empty space, as per the spec. */
const ID_DELIMITER = ' ';

/**
 * Adds the given ID to the specified ARIA attribute on an element.
 * Used for attributes such as aria-labelledby, aria-owns, etc.
 */
export function addAriaReferencedId(el: Element, attr: string, id: string) {
  const ids = getAriaReferenceIds(el, attr);
  if (ids.some(existingId => existingId.trim() == id.trim())) {
    return;
  }
  ids.push(id.trim());

  el.setAttribute(attr, ids.join(ID_DELIMITER));
}

/**
 * Removes the given ID from the specified ARIA attribute on an element.
 * Used for attributes such as aria-labelledby, aria-owns, etc.
 */
export function removeAriaReferencedId(el: Element, attr: string, id: string) {
  const ids = getAriaReferenceIds(el, attr);
  const filteredIds = ids.filter(val => val != id.trim());

  if (filteredIds.length) {
    el.setAttribute(attr, filteredIds.join(ID_DELIMITER));
  } else {
    el.removeAttribute(attr);
  }
}

/**
 * Gets the list of IDs referenced by the given ARIA attribute on an element.
 * Used for attributes such as aria-labelledby, aria-owns, etc.
 */
export function getAriaReferenceIds(el: Element, attr: string): string[] {
  // Get string array of all individual ids (whitespace delimited) in the attribute value
  return (el.getAttribute(attr) || '').match(/\S+/g) || [];
}
