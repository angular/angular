/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {devModeEqual} from '../change_detection/change_detection_util';

import {assertDefined, assertLessThan} from './assert';
import {ACTIVE_INDEX, LContainer} from './interfaces/container';
import {LContext, MONKEY_PATCH_KEY_NAME} from './interfaces/context';
import {LContainerNode, LElementContainerNode, LElementNode, LNode, TNode, TNodeFlags} from './interfaces/node';
import {RComment, RElement, RText} from './interfaces/renderer';
import {StylingContext} from './interfaces/styling';
import {CONTEXT, FLAGS, HEADER_OFFSET, HOST, LViewData, LViewFlags, PARENT, RootContext, TData, TVIEW, TView} from './interfaces/view';


/**
 * Returns whether the values are different from a change detection stand point.
 *
 * Constraints are relaxed in checkNoChanges mode. See `devModeEqual` for details.
 */
export function isDifferent(a: any, b: any, checkNoChangesMode: boolean): boolean {
  if (ngDevMode && checkNoChangesMode) {
    return !devModeEqual(a, b);
  }
  // NaN is the only value that is not equal to itself so the first
  // test checks if both a and b are not NaN
  return !(a !== a && b !== b) && a !== b;
}

export function stringify(value: any): string {
  if (typeof value == 'function') return value.name || value;
  if (typeof value == 'string') return value;
  if (value == null) return '';
  return '' + value;
}

/**
 *  Function that throws a "not implemented" error so it's clear certain
 *  behaviors/methods aren't yet ready.
 *
 * @returns Not implemented error
 */
export function notImplemented(): Error {
  return new Error('NotImplemented');
}

/**
 * Flattens an array in non-recursive way. Input arrays are not modified.
 */
export function flatten(list: any[]): any[] {
  const result: any[] = [];
  let i = 0;

  while (i < list.length) {
    const item = list[i];
    if (Array.isArray(item)) {
      if (item.length > 0) {
        list = item.concat(list.slice(i + 1));
        i = 0;
      } else {
        i++;
      }
    } else {
      result.push(item);
      i++;
    }
  }

  return result;
}

/** Retrieves a value from any `LViewData` or `TData`. */
export function loadInternal<T>(index: number, arr: LViewData | TData): T {
  ngDevMode && assertDataInRangeInternal(index + HEADER_OFFSET, arr);
  return arr[index + HEADER_OFFSET];
}

export function assertDataInRangeInternal(index: number, arr: any[]) {
  assertLessThan(index, arr ? arr.length : 0, 'index expected to be a valid data index');
}

/** Retrieves an element value from the provided `viewData`.
  *
  * Elements that are read may be wrapped in a style context,
  * therefore reading the value may involve unwrapping that.
  */
export function loadElementInternal(index: number, arr: LViewData): LElementNode {
  const value = loadInternal<LElementNode>(index, arr);
  return readElementValue(value);
}

/**
 * Takes the value of a slot in `LViewData` and returns the element node.
 *
 * Normally, element nodes are stored flat, but if the node has styles/classes on it,
 * it might be wrapped in a styling context. Or if that node has a directive that injects
 * ViewContainerRef, it may be wrapped in an LContainer. Or if that node is a component,
 * it will be wrapped in LViewData. It could even have all three, so we keep looping
 * until we find something that isn't an array.
 *
 * @param value The initial value in `LViewData`
 */
export function readElementValue(value: LElementNode | StylingContext | LContainer | LViewData):
    LElementNode {
  while (Array.isArray(value)) {
    value = value[HOST] as any;
  }
  return value;
}

export function getNative(tNode: TNode, hostView: LViewData): RElement|RText|RComment {
  return getLNode(tNode, hostView).native;
}

// TODO(kara): remove when removing LNode.native
export function getLNode(tNode: TNode, hostView: LViewData): LElementNode|LContainerNode|
    LElementContainerNode {
  return readElementValue(hostView[tNode.index]);
}

export function getTNode(index: number, view: LViewData): TNode {
  return view[TVIEW].data[index + HEADER_OFFSET] as TNode;
}

export function getComponentViewByIndex(nodeIndex: number, hostView: LViewData): LViewData {
  // Could be an LViewData or an LContainer. If LContainer, unwrap to find LViewData.
  const slotValue = hostView[nodeIndex];
  return slotValue.length >= HEADER_OFFSET ? slotValue : slotValue[HOST];
}

export function isContentQueryHost(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.hasContentQuery) !== 0;
}

export function isComponent(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.isComponent) === TNodeFlags.isComponent;
}

export function isLContainer(value: LNode | LContainer | StylingContext): boolean {
  // Styling contexts are also arrays, but their first index contains an element node
  return Array.isArray(value) && typeof value[ACTIVE_INDEX] === 'number';
}

/**
 * Retrieve the root view from any component by walking the parent `LViewData` until
 * reaching the root `LViewData`.
 *
 * @param component any component
 */
export function getRootView(target: LViewData | {}): LViewData {
  ngDevMode && assertDefined(target, 'component');
  let lViewData = Array.isArray(target) ? (target as LViewData) : readPatchedLViewData(target) !;
  while (lViewData && !(lViewData[FLAGS] & LViewFlags.IsRoot)) {
    lViewData = lViewData[PARENT] !;
  }
  return lViewData;
}

export function getRootContext(viewOrComponent: LViewData | {}): RootContext {
  return getRootView(viewOrComponent)[CONTEXT] as RootContext;
}

/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export function readPatchedData(target: any): LViewData|LContext|null {
  return target[MONKEY_PATCH_KEY_NAME];
}

export function readPatchedLViewData(target: any): LViewData|null {
  const value = readPatchedData(target);
  if (value) {
    return Array.isArray(value) ? value : (value as LContext).lViewData;
  }
  return null;
}
