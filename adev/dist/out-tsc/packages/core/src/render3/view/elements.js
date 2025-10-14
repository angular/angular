/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertFirstCreatePass} from '../assert';
import {registerPostOrderHooks} from '../hooks';
import {isContentQueryHost} from '../interfaces/type_checks';
import {TVIEW} from '../interfaces/view';
import {computeStaticStyling} from '../styling/static_styling';
import {getOrCreateTNode} from '../tnode_manipulation';
import {mergeHostAttrs} from '../util/attrs_utils';
import {getConstant} from '../util/view_utils';
import {resolveDirectives} from './directives';
export function directiveHostFirstCreatePass(
  index,
  lView,
  type,
  name,
  directiveMatcher,
  bindingsEnabled,
  attrsIndex,
  localRefsIndex,
) {
  const tView = lView[TVIEW];
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;
  const attrs = getConstant(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, type, name, attrs);
  if (bindingsEnabled) {
    resolveDirectives(
      tView,
      lView,
      tNode,
      getConstant(tViewConsts, localRefsIndex),
      directiveMatcher,
    );
  }
  // Merge the template attrs last so that they have the highest priority.
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
  if (tNode.attrs !== null) {
    computeStaticStyling(tNode, tNode.attrs, false);
  }
  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);
  }
  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }
  return tNode;
}
export function directiveHostEndFirstCreatePass(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  registerPostOrderHooks(tView, tNode);
  if (isContentQueryHost(tNode)) {
    tView.queries.elementEnd(tNode);
  }
}
export function domOnlyFirstCreatePass(index, tView, type, name, attrsIndex, localRefsIndex) {
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;
  const attrs = getConstant(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, type, name, attrs);
  // Merge the template attrs last so that they have the highest priority.
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
  if (localRefsIndex != null) {
    const refs = getConstant(tViewConsts, localRefsIndex);
    tNode.localNames = [];
    for (let i = 0; i < refs.length; i += 2) {
      // Always -1 since DOM-only instructions can only refer to the native node.
      tNode.localNames.push(refs[i], -1);
    }
  }
  if (tNode.attrs !== null) {
    computeStaticStyling(tNode, tNode.attrs, false);
  }
  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);
  }
  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }
  return tNode;
}
//# sourceMappingURL=elements.js.map
