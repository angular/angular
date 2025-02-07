/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LContainer, TYPE} from './container';
import {ComponentDef, DirectiveDef} from './definition';
import {TNode, TNodeFlags, TNodeType} from './node';
import {RNode} from './renderer_dom';
import {FLAGS, LView, LViewFlags} from './view';

/**
 * True if `value` is `LView`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function isLView(value: RNode | LView | LContainer | {} | null): value is LView {
  return Array.isArray(value) && typeof value[TYPE] === 'object';
}

/**
 * True if `value` is `LContainer`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function isLContainer(value: RNode | LView | LContainer | {} | null): value is LContainer {
  return Array.isArray(value) && value[TYPE] === true;
}

export function isContentQueryHost(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.hasContentQuery) !== 0;
}

export function isComponentHost(tNode: TNode): boolean {
  return tNode.componentOffset > -1;
}

export function isDirectiveHost(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.isDirectiveHost) === TNodeFlags.isDirectiveHost;
}

export function isComponentDef<T>(def: DirectiveDef<T>): def is ComponentDef<T> {
  return !!(def as ComponentDef<T>).template;
}

export function isRootView(target: LView): boolean {
  // Determines whether a given LView is marked as a root view.
  return (target[FLAGS] & LViewFlags.IsRoot) !== 0;
}

export function isProjectionTNode(tNode: TNode): boolean {
  return (tNode.type & TNodeType.Projection) === TNodeType.Projection;
}

export function hasI18n(lView: LView): boolean {
  return (lView[FLAGS] & LViewFlags.HasI18n) === LViewFlags.HasI18n;
}

export function isDestroyed(lView: LView): boolean {
  // Determines whether a given LView is marked as destroyed.
  return (lView[FLAGS] & LViewFlags.Destroyed) === LViewFlags.Destroyed;
}
