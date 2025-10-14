/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TYPE} from './container';
import {FLAGS} from './view';
/**
 * True if `value` is `LView`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function isLView(value) {
  return Array.isArray(value) && typeof value[TYPE] === 'object';
}
/**
 * True if `value` is `LContainer`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export function isLContainer(value) {
  return Array.isArray(value) && value[TYPE] === true;
}
export function isContentQueryHost(tNode) {
  return (tNode.flags & 4) /* TNodeFlags.hasContentQuery */ !== 0;
}
export function isComponentHost(tNode) {
  return tNode.componentOffset > -1;
}
export function isDirectiveHost(tNode) {
  return (tNode.flags & 1) /* TNodeFlags.isDirectiveHost */ === 1 /* TNodeFlags.isDirectiveHost */;
}
export function isComponentDef(def) {
  return !!def.template;
}
export function isRootView(target) {
  // Determines whether a given LView is marked as a root view.
  return (target[FLAGS] & 512) /* LViewFlags.IsRoot */ !== 0;
}
export function isProjectionTNode(tNode) {
  return (tNode.type & 16) /* TNodeType.Projection */ === 16 /* TNodeType.Projection */;
}
export function hasI18n(lView) {
  return (lView[FLAGS] & 32) /* LViewFlags.HasI18n */ === 32 /* LViewFlags.HasI18n */;
}
export function isDestroyed(lView) {
  // Determines whether a given LView is marked as destroyed.
  return (lView[FLAGS] & 256) /* LViewFlags.Destroyed */ === 256 /* LViewFlags.Destroyed */;
}
//# sourceMappingURL=type_checks.js.map
