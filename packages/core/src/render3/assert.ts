/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertDomNode, assertEqual, throwError} from '../util/assert';

import {getComponentDef, getNgModuleDef} from './definition';
import {LContainer, NATIVE, VIEWS} from './interfaces/container';
import {TNode, TNodeType} from './interfaces/node';
import {RNode} from './interfaces/renderer';
import {LView, TVIEW} from './interfaces/view';
import {getNativeByTNode, isLContainer, isLView, unwrapLView} from './util/view_utils';


export function assertComponentType(
    actual: any,
    msg: string =
        'Type passed in is not ComponentType, it does not have \'ngComponentDef\' property.') {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}

export function assertNgModuleType(
    actual: any,
    msg: string =
        'Type passed in is not NgModuleType, it does not have \'ngModuleDef\' property.') {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}

export function assertPreviousIsParent(isParent: boolean) {
  assertEqual(isParent, true, 'previousOrParentTNode should be a parent');
}

export function assertHasParent(tNode: TNode) {
  assertDefined(tNode.parent, 'previousOrParentTNode should have a parent');
}

export function assertDataNext(lView: LView, index: number, arr?: any[]) {
  if (arr == null) arr = lView;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
}

export function assertLContainerOrUndefined(value: any): void {
  value && assertEqual(isLContainer(value), true, 'Expecting LContainer or undefined or null');
}

export function assertLContainer(value: any): void {
  assertDefined(value, 'LContainer must be defined');
  assertEqual(isLContainer(value), true, 'Expecting LContainer');
}

export function assertLViewOrUndefined(value: any): void {
  value && assertEqual(isLView(value), true, 'Expecting LView or undefined or null');
}

export function assertLView(value: any) {
  assertDefined(value, 'LView must be defined');
  assertEqual(isLView(value), true, 'Expecting LView');
}

export function assertRNodeIsInView(lView: LView, rNode: RNode) {
  assertEqual(isRNodeInLView(lView, rNode), true, 'RNode is not in LView');
}

/**
 * Searches the lView by traversing it's TNodes looking for a specific RNode
 * @param lView The lView to search
 * @param rNode The RNode to look for
 * @returns true if the RNode is found anywhere under the LView
 */
function isRNodeInLView(lView: LView, rNode: RNode): boolean {
  assertLView(lView);
  assertDomNode(rNode);
  const tView = lView[TVIEW];
  let tNode = tView.firstChild;
  let tNodeStack: TNode[] = [];
  while (tNode) {
    switch (tNode.type) {
      case TNodeType.Element:
      case TNodeType.ElementContainer:
        // An element type, let's check it
        if (rNode === getNativeByTNode(tNode, lView)) {
          return true;
        }
        break;
      case TNodeType.View:
        // We found a view, crawl in an look
        return isRNodeInLView(unwrapLView(lView[tNode.index]) !, rNode);
      case TNodeType.Container:
        // For a container, we're going to crawl into each of its views
        const lContainer = lView[tNode.index] as LContainer;
        if (lContainer[NATIVE] === rNode) {
          return true;
        }
        const views = lContainer[VIEWS];
        if (views.some(view => isRNodeInLView(view, rNode))) {
          return true;
        }
        break;
      case TNodeType.Projection:
      case TNodeType.IcuContainer:
        // These two types don't have any RNodes that actually exist in DOM yet.
        break;
    }
    if (tNode.child) {
      // If we have children, crawl in
      tNodeStack.push(tNode);
      tNode = tNode.child;
    } else {
      // Move to the next sibling
      tNode = tNode.next;
      if (!tNode) {
        // If we don't have a next sibling, try the parent's next sibling
        tNode = (tNodeStack.length > 0) ? tNodeStack.pop() !.next : null;
      }
    }
  }
  return false;
}
