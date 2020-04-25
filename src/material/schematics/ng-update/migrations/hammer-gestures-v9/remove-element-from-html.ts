/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdateRecorder} from '@angular-devkit/schematics';
import {parse5} from '@angular/cdk/schematics';

/**
 * Removes the specified element. Additionally, preceding whitespace will be removed
 * to not leave empty lines in the resulting HTML.
 */
export function removeElementFromHtml(
    element: parse5.DefaultTreeElement, recorder: UpdateRecorder) {
  // sourceCodeLocation is always set since we parse with location info enabled.
  const {startOffset, endOffset} = element.sourceCodeLocation!;
  const parentIndex = element.parentNode.childNodes.indexOf(element);
  const precedingTextSibling = element.parentNode.childNodes.find(
      (f, i): f is parse5.DefaultTreeTextNode => f.nodeName === '#text' && i === parentIndex - 1);

  recorder.remove(startOffset, endOffset - startOffset);

  // If we found a preceding text node which just consists of whitespace, remove it.
  if (precedingTextSibling && /^\s+$/.test(precedingTextSibling.value)) {
    const textSiblingLocation = precedingTextSibling.sourceCodeLocation!;
    recorder.remove(
        textSiblingLocation.startOffset,
        textSiblingLocation.endOffset - textSiblingLocation.startOffset);
  }
}
