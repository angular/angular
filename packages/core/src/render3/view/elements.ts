/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertFirstCreatePass} from '../assert';
import {registerPostOrderHooks} from '../hooks';
import {
  TAttributes,
  TElementContainerNode,
  TNode,
  TNodeType,
  type TElementNode,
} from '../interfaces/node';
import {isContentQueryHost} from '../interfaces/type_checks';
import {TVIEW, type LView, type TView} from '../interfaces/view';
import {computeStaticStyling} from '../styling/static_styling';
import {getOrCreateTNode} from '../tnode_manipulation';
import {mergeHostAttrs} from '../util/attrs_utils';
import {getConstant} from '../util/view_utils';
import {resolveDirectives, type DirectiveMatcherStrategy} from './directives';

export function directiveHostFirstCreatePass(
  index: number,
  lView: LView,
  type: TNodeType.Element | TNodeType.ElementContainer,
  name: string,
  directiveMatcher: DirectiveMatcherStrategy,
  bindingsEnabled: boolean,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): TElementNode | TElementContainerNode {
  const tView = lView[TVIEW];
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;
  const attrs = getConstant<TAttributes>(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, type, name, attrs) as
    | TElementNode
    | TElementContainerNode;

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

export function directiveHostEndFirstCreatePass(tView: TView, tNode: TNode) {
  ngDevMode && assertFirstCreatePass(tView);
  registerPostOrderHooks(tView, tNode);
  if (isContentQueryHost(tNode)) {
    tView.queries!.elementEnd(tNode);
  }
}

export function domOnlyFirstCreatePass(
  index: number,
  tView: TView,
  type: TNodeType.Element | TNodeType.ElementContainer,
  name: string,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): TElementNode | TElementContainerNode {
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;
  const attrs = getConstant<TAttributes>(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, type, name, attrs) as
    | TElementNode
    | TElementContainerNode;

  // Merge the template attrs last so that they have the highest priority.
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);

  if (localRefsIndex != null) {
    const refs = getConstant<string[]>(tViewConsts, localRefsIndex)!;
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
