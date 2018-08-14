/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultTreeElement} from 'parse5';

/** Determines the indentation of child elements for the given Parse5 element. */
export function getChildElementIndentation(element: DefaultTreeElement) {
  const childElement = element.childNodes
    .find(node => node['tagName']) as DefaultTreeElement | null;

  const startColumns = childElement ?
    // In case there are child elements inside of the element, we assume that their
    // indentation is also applicable for other child elements.
    childElement.sourceCodeLocation.startCol :
    // In case there is no child element, we just assume that child elements should be indented
    // by two spaces.
    element.sourceCodeLocation.startCol + 2;

  // Since Parse5 does not set the `startCol` properties as zero-based, we need to subtract
  // one column in order to have a proper zero-based offset for the indentation.
  return startColumns - 1;
}
