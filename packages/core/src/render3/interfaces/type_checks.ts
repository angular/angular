/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentDef, DirectiveDef} from '..';

import {LContainer, TYPE} from './container';
import {TNode, TNodeFlags} from './node';
import {RNode} from './renderer';
import {StylingContext} from './styling';
import {FLAGS, LView, LViewFlags} from './view';


/**
* True if `value` is `LView`.
* @param value wrapped value of `RNode`, `LView`, `LContainer`, `StylingContext`
*/
export function isLView(value: RNode | LView | LContainer | StylingContext | {} | null):
    value is LView {
  return Array.isArray(value) && typeof value[TYPE] === 'object';
}

/**
 * True if `value` is `LContainer`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`, `StylingContext`
 */
export function isLContainer(value: RNode | LView | LContainer | StylingContext | {} | null):
    value is LContainer {
  return Array.isArray(value) && value[TYPE] === true;
}

/**
 * True if `value` is `StylingContext`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`, `StylingContext`
 */
export function isStylingContext(value: RNode | LView | LContainer | StylingContext | {} | null):
    value is StylingContext {
  return Array.isArray(value) && typeof value[TYPE] === 'number';
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

export function isRootView(target: LView): boolean {
  return (target[FLAGS] & LViewFlags.IsRoot) !== 0;
}
