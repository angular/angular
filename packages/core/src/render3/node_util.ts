/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RelativeInjectorLocation} from './interfaces/injector';
import {TContainerNode, TElementNode, TNode} from './interfaces/node';
import {DECLARATION_VIEW, LView, T_HOST} from './interfaces/view';
import {getParentInjectorViewOffset} from './util/injector_utils';

export function applyOnCreateInstructions(tNode: TNode) {
  // there may be some instructions that need to run in a specific
  // order because the CREATE block in a directive runs before the
  // CREATE block in a template. To work around this instructions
  // can get access to the function array below and defer any code
  // to run after the element is created.
  let fns: Function[]|null;
  if (fns = tNode.onElementCreationFns) {
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
    tNode.onElementCreationFns = null;
  }
}

/**
 * Unwraps a parent injector location number to find the view offset from the current injector,
 * then walks up the declaration view tree until the TNode of the parent injector is found.
 *
 * @param location The location of the parent injector, which contains the view offset
 * @param startView The LView instance from which to start walking up the view tree
 * @param startTNode The TNode instance of the starting element
 * @returns The TNode of the parent injector
 */
export function getParentInjectorTNode(
    location: RelativeInjectorLocation, startView: LView, startTNode: TNode): TElementNode|
    TContainerNode|null {
  if (startTNode.parent && startTNode.parent.injectorIndex !== -1) {
    // view offset is 0
    const injectorIndex = startTNode.parent.injectorIndex;
    let parentTNode = startTNode.parent;
    while (parentTNode.parent != null && injectorIndex == parentTNode.injectorIndex) {
      parentTNode = parentTNode.parent;
    }
    return parentTNode;
  }
  let viewOffset = getParentInjectorViewOffset(location);
  // view offset is 1
  let parentView = startView;
  let parentTNode = startView[T_HOST] as TElementNode;
  // view offset is superior to 1
  while (viewOffset > 1) {
    parentView = parentView[DECLARATION_VIEW] !;
    parentTNode = parentView[T_HOST] as TElementNode;
    viewOffset--;
  }
  return parentTNode;
}
