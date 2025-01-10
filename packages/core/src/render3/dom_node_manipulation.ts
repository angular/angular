/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer} from './interfaces/renderer';
import {RComment, RElement, RNode, RText} from './interfaces/renderer_dom';
import {escapeCommentText} from '../util/dom';
import {assertDefined} from '../util/assert';

export function createTextNode(renderer: Renderer, value: string): RText {
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  ngDevMode && ngDevMode.rendererSetText++;
  return renderer.createText(value);
}

export function updateTextNode(renderer: Renderer, rNode: RText, value: string): void {
  ngDevMode && ngDevMode.rendererSetText++;
  renderer.setValue(rNode, value);
}

export function createCommentNode(renderer: Renderer, value: string): RComment {
  ngDevMode && ngDevMode.rendererCreateComment++;
  return renderer.createComment(escapeCommentText(value));
}

/**
 * Creates a native element from a tag name, using a renderer.
 * @param renderer A renderer to use
 * @param name the tag name
 * @param namespace Optional namespace for element.
 * @returns the element created
 */
export function createElementNode(
  renderer: Renderer,
  name: string,
  namespace: string | null,
): RElement {
  ngDevMode && ngDevMode.rendererCreateElement++;
  return renderer.createElement(name, namespace);
}

/**
 * Inserts a native node before another native node for a given parent.
 * This is a utility function that can be used when native nodes were determined.
 */
export function nativeInsertBefore(
  renderer: Renderer,
  parent: RElement,
  child: RNode,
  beforeNode: RNode | null,
  isMove: boolean,
): void {
  ngDevMode && ngDevMode.rendererInsertBefore++;
  renderer.insertBefore(parent, child, beforeNode, isMove);
}

export function nativeAppendChild(renderer: Renderer, parent: RElement, child: RNode): void {
  ngDevMode && ngDevMode.rendererAppendChild++;
  ngDevMode && assertDefined(parent, 'parent node must be defined');
  renderer.appendChild(parent, child);
}

export function nativeAppendOrInsertBefore(
  renderer: Renderer,
  parent: RElement,
  child: RNode,
  beforeNode: RNode | null,
  isMove: boolean,
) {
  if (beforeNode !== null) {
    nativeInsertBefore(renderer, parent, child, beforeNode, isMove);
  } else {
    nativeAppendChild(renderer, parent, child);
  }
}

/**
 * Removes a native node itself using a given renderer. To remove the node we are looking up its
 * parent from the native tree as not all platforms / browsers support the equivalent of
 * node.remove().
 *
 * @param renderer A renderer to be used
 * @param rNode The native node that should be removed
 * @param isHostElement A flag indicating if a node to be removed is a host of a component.
 */
export function nativeRemoveNode(renderer: Renderer, rNode: RNode, isHostElement?: boolean): void {
  ngDevMode && ngDevMode.rendererRemoveNode++;
  renderer.removeChild(null, rNode, isHostElement);
}

/**
 * Clears the contents of a given RElement.
 *
 * @param rElement the native RElement to be cleared
 */
export function clearElementContents(rElement: RElement): void {
  rElement.textContent = '';
}
