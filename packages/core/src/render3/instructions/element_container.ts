/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange, assertEqual} from '../../util/assert';
import {assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {registerPostOrderHooks} from '../hooks';
import {TAttributes, TNodeType} from '../interfaces/node';
import {BINDING_INDEX, QUERIES, RENDERER, TVIEW} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild} from '../node_manipulation';
import {getIsParent, getLView, getPreviousOrParentTNode, setIsParent, setPreviousOrParentTNode} from '../state';
import {createDirectivesAndLocals, createNodeAtIndex, executeContentQueries, setNodeStylingTemplate} from './shared';

/**
 * Creates a logical container for other nodes (<ng-container>) backed by a comment node in the DOM.
 * The instruction must later be followed by `elementContainerEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param attrs Set of attributes to be used when matching directives.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Even if this instruction accepts a set of attributes no actual attribute values are propagated to
 * the DOM (as a comment node can't have attributes). Attributes are here only for directive
 * matching purposes and setting initial inputs of directives.
 */
export function elementContainerStart(
    index: number, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  const renderer = lView[RENDERER];
  const tagName = 'ng-container';
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], tView.bindingStartIndex,
                   'element containers should be created before any bindings');

  ngDevMode && ngDevMode.rendererCreateComment++;
  const native = renderer.createComment(ngDevMode ? tagName : '');

  ngDevMode && assertDataInRange(lView, index - 1);
  const tNode =
      createNodeAtIndex(index, TNodeType.ElementContainer, native, tagName, attrs || null);


  if (attrs) {
    // While ng-container doesn't necessarily support styling, we use the style context to identify
    // and execute directives on the ng-container.
    setNodeStylingTemplate(tView, tNode, attrs, 0);
  }

  appendChild(native, tNode, lView);
  createDirectivesAndLocals(tView, lView, localRefs);
  attachPatchData(native, lView);

  const currentQueries = lView[QUERIES];
  if (currentQueries) {
    currentQueries.addNode(tNode);
    lView[QUERIES] = currentQueries.clone();
  }
  executeContentQueries(tView, tNode, lView);
}

/** Mark the end of the <ng-container>. */
export function elementContainerEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  const lView = getLView();
  const tView = lView[TVIEW];
  if (getIsParent()) {
    setIsParent(false);
  } else {
    ngDevMode && assertHasParent(previousOrParentTNode);
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.ElementContainer);
  const currentQueries = lView[QUERIES];
  if (currentQueries) {
    lView[QUERIES] = currentQueries.parent;
  }

  registerPostOrderHooks(tView, previousOrParentTNode);
}
