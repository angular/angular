/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDataInRange, assertDefined, assertGreaterThan, assertLessThan} from '../../util/assert';
import {LCONTAINER_LENGTH, LContainer} from '../interfaces/container';
import {LContext, MONKEY_PATCH_KEY_NAME} from '../interfaces/context';
import {ComponentDef, DirectiveDef} from '../interfaces/definition';
import {TNode, TNodeFlags} from '../interfaces/node';
import {RComment, RElement, RText} from '../interfaces/renderer';
import {FLAGS, HEADER_OFFSET, HOST, LView, LViewFlags, TData, TVIEW} from '../interfaces/view';



/**
 * Takes the value of a slot in `LView` and returns the element node.
 *
 * Normally, element nodes are stored flat, but if the node has styles/classes on it,
 * it might be wrapped in a styling context. Or if that node has a directive that injects
 * ViewContainerRef, it may be wrapped in an LContainer. Or if that node is a component,
 * it will be wrapped in LView. It could even have all three, so we keep looping
 * until we find something that isn't an array.
 *
 * @param value The initial value in `LView`
 */
export function readElementValue(value: any): RElement {
  while (Array.isArray(value)) {
    value = value[HOST] as any;
  }
  return value;
}

/**
 * Retrieves an element value from the provided `viewData`, by unwrapping
 * from any containers, component views, or style contexts.
 */
export function getNativeByIndex(index: number, lView: LView): RElement {
  return readElementValue(lView[index + HEADER_OFFSET]);
}

export function getNativeByTNode(tNode: TNode, hostView: LView): RElement|RText|RComment {
  return readElementValue(hostView[tNode.index]);
}

export function getTNode(index: number, view: LView): TNode {
  ngDevMode && assertGreaterThan(index, -1, 'wrong index for TNode');
  ngDevMode && assertLessThan(index, view[TVIEW].data.length, 'wrong index for TNode');
  return view[TVIEW].data[index + HEADER_OFFSET] as TNode;
}

/**
 * Returns true if the value is an {@link LView}
 * @param value the value to check
 */
export function isLView(value: any): value is LView {
  return Array.isArray(value) && value.length >= HEADER_OFFSET;
}

/** Retrieves a value from any `LView` or `TData`. */
export function loadInternal<T>(view: LView | TData, index: number): T {
  ngDevMode && assertDataInRange(view, index + HEADER_OFFSET);
  return view[index + HEADER_OFFSET];
}

export function getComponentViewByIndex(nodeIndex: number, hostView: LView): LView {
  // Could be an LView or an LContainer. If LContainer, unwrap to find LView.
  const slotValue = hostView[nodeIndex];
  const lView = isLView(slotValue) ? slotValue : slotValue[HOST];
  return lView;
}

export function isContentQueryHost(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.hasContentQuery) !== 0;
}

export function isComponent(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.isComponent) === TNodeFlags.isComponent;
}

export function isComponentDef<T>(def: DirectiveDef<T>): def is ComponentDef<T> {
  return (def as ComponentDef<T>).template !== null;
}

export function isLContainer(value: any): value is LContainer {
  // Styling contexts are also arrays, but their first index contains an element node
  return Array.isArray(value) && value.length === LCONTAINER_LENGTH;
}

export function isRootView(target: LView): boolean {
  return (target[FLAGS] & LViewFlags.IsRoot) !== 0;
}

/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export function readPatchedData(target: any): LView|LContext|null {
  ngDevMode && assertDefined(target, 'Target expected');
  return target[MONKEY_PATCH_KEY_NAME];
}

export function readPatchedLView(target: any): LView|null {
  const value = readPatchedData(target);
  if (value) {
    return Array.isArray(value) ? value : (value as LContext).lView;
  }
  return null;
}
