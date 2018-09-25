/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findAttributeOnElementWithAttrs, findAttributeOnElementWithTag} from './elements';

/** Finds the specified Angular @Input in the given elements with tag name. */
export function findInputsOnElementWithTag(html: string, inputName: string, tagNames: string[]) {
  return [
    // Inputs can be also used without brackets (e.g. `<mat-toolbar color="primary">`)
    ...findAttributeOnElementWithTag(html, inputName, tagNames),
    // Add one column to the mapped offset because the first bracket for the @Input
    // is part of the attribute and therefore also part of the offset. We only want to return
    // the offset for the inner name of the bracketed input.
    ...findAttributeOnElementWithTag(html, `[${inputName}]`, tagNames).map(offset => offset + 1),
  ];
}

/** Finds the specified Angular @Input in elements that have one of the specified attributes. */
export function findInputsOnElementWithAttr(html: string, inputName: string, attrs: string[]) {
  return [
    // Inputs can be also used without brackets (e.g. `<button mat-button color="primary">`)
    ...findAttributeOnElementWithAttrs(html, inputName, attrs),
    // Add one column to the mapped offset because the first bracket for the @Input
    // is part of the attribute and therefore also part of the offset. We only want to return
    // the offset for the inner name of the bracketed input.
    ...findAttributeOnElementWithAttrs(html, `[${inputName}]`, attrs).map(offset => offset + 1),
  ];
}

/** Finds the specified Angular @Output in the given elements with tag name. */
export function findOutputsOnElementWithTag(html: string, outputName: string, tagNames: string[]) {
  // Add one column to the mapped offset because the first parenthesis for the @Output
  // is part of the attribute and therefore also part of the offset. We only want to return
  // the offset for the inner name of the output.
  return findAttributeOnElementWithTag(html, `(${outputName})`, tagNames).map(offset => offset + 1);
}

/** Finds the specified Angular @Output in elements that have one of the specified attributes. */
export function findOutputsOnElementWithAttr(html: string, outputName: string, attrs: string[]) {
  // Add one column to the mapped offset because the first bracket for the @Output
  // is part of the attribute and therefore also part of the offset. We only want to return
  // the offset for the inner name of the output.
  return findAttributeOnElementWithAttrs(html, `(${outputName})`, attrs).map(offset => offset + 1);
}
