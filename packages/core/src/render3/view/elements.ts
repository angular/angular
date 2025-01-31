/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertFirstCreatePass} from '../assert';
import {registerPostOrderHooks} from '../hooks';
import {TAttributes, TNode, TNodeType, type TElementNode} from '../interfaces/node';
import {isContentQueryHost} from '../interfaces/type_checks';
import type {LView, TView} from '../interfaces/view';
import {computeStaticStyling} from '../styling/static_styling';
import {getOrCreateTNode} from '../tnode_manipulation';
import {mergeHostAttrs} from '../util/attrs_utils';
import {getConstant} from '../util/view_utils';
import {resolveDirectives, type DirectiveMatcherStrategy} from './directives';

export function elementStartFirstCreatePass(
  index: number,
  tView: TView,
  lView: LView,
  name: string,
  directiveMatcher: DirectiveMatcherStrategy,
  bindingsEnabled: boolean,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): TElementNode {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;

  const tViewConsts = tView.consts;
  const attrs = getConstant<TAttributes>(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, TNodeType.Element, name, attrs);

  if (bindingsEnabled) {
    resolveDirectives(
      tView,
      lView,
      tNode,
      getConstant<string[]>(tViewConsts, localRefsIndex),
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

export function elementEndFirstCreatePass(tView: TView, tNode: TNode) {
  ngDevMode && assertFirstCreatePass(tView);
  registerPostOrderHooks(tView, tNode);
  if (isContentQueryHost(tNode)) {
    tView.queries!.elementEnd(tNode);
  }
}
