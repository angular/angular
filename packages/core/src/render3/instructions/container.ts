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
import {executePreOrderHooks, registerPostOrderHooks} from '../hooks';
import {ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {ComponentTemplate} from '../interfaces/definition';
import {LocalRefExtractor, TAttributes, TContainerNode, TNode, TNodeType} from '../interfaces/node';
import {BINDING_INDEX, HEADER_OFFSET, LView, RENDERER, TVIEW, T_HOST} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild, removeView} from '../node_manipulation';
import {getCheckNoChangesMode, getIsParent, getLView, getPreviousOrParentTNode, setIsNotParent, setPreviousOrParentTNode} from '../state';
import {getNativeByTNode, loadInternal} from '../util/view_utils';

import {addToViewTree, createDirectivesAndLocals, createLContainer, createTView, getOrCreateTNode, resolveDirectives} from './shared';



/**
 * Creates an LContainer for inline views, e.g.
 *
 * % if (showing) {
 *   <div></div>
 * % }
 *
 * @param index The index of the container in the data array
 *
 * @codeGenApi
 */
export function ɵɵcontainer(index: number): void {
  const lView = getLView();
  const tNode = containerInternal(lView, index, null, null);

  if (lView[TVIEW].firstTemplatePass) {
    tNode.tViews = [];
  }
  setIsNotParent();
}

/**
 * Creates an LContainer for an ng-template (dynamically-inserted view), e.g.
 *
 * <ng-template #foo>
 *    <div></div>
 * </ng-template>
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param consts The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 * @param localRefs A set of local reference bindings on the element.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 *
 * @codeGenApi
 */
export function ɵɵtemplate(
    index: number, templateFn: ComponentTemplate<any>| null, consts: number, vars: number,
    tagName?: string | null, attrs?: TAttributes | null, localRefs?: string[] | null,
    localRefExtractor?: LocalRefExtractor) {
  const lView = getLView();
  const tView = lView[TVIEW];

  // TODO: consider a separate node type for templates
  const tContainerNode = containerInternal(lView, index, tagName || null, attrs || null);
  if (tView.firstTemplatePass) {
    ngDevMode && ngDevMode.firstTemplatePass++;
    resolveDirectives(tView, lView, tContainerNode, localRefs || null);

    const embeddedTView = tContainerNode.tViews = createTView(
        -1, templateFn, consts, vars, tView.directiveRegistry, tView.pipeRegistry, null,
        tView.schemas);
    if (tView.queries !== null) {
      tView.queries.template(tView, tContainerNode);
      embeddedTView.queries = tView.queries.embeddedTView(tContainerNode);
    }
  }

  createDirectivesAndLocals(tView, lView, tContainerNode, localRefExtractor);
  attachPatchData(getNativeByTNode(tContainerNode, lView), lView);
  registerPostOrderHooks(tView, tContainerNode);
  setIsNotParent();
}

/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 *
 * @codeGenApi
 */
export function ɵɵcontainerRefreshStart(index: number): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  let previousOrParentTNode = loadInternal(tView.data, index) as TNode;
  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);
  setPreviousOrParentTNode(previousOrParentTNode, true);

  lView[index + HEADER_OFFSET][ACTIVE_INDEX] = 0;

  // We need to execute init hooks here so ngOnInit hooks are called in top level views
  // before they are called in embedded views (for backwards compatibility).
  executePreOrderHooks(lView, tView, getCheckNoChangesMode(), undefined);
}

/**
 * Marks the end of the LContainer.
 *
 * Marking the end of LContainer is the time when to child views get inserted or removed.
 *
 * @codeGenApi
 */
export function ɵɵcontainerRefreshEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  if (getIsParent()) {
    setIsNotParent();
  } else {
    ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.View);
    ngDevMode && assertHasParent(previousOrParentTNode);
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode, false);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);

  const lContainer: LContainer = getLView()[previousOrParentTNode.index];
  const nextIndex = lContainer[ACTIVE_INDEX];

  // remove extra views at the end of the container
  while (nextIndex < lContainer.length - CONTAINER_HEADER_OFFSET) {
    removeView(lContainer, nextIndex);
  }
}

function containerInternal(
    lView: LView, nodeIndex: number, tagName: string | null,
    attrs: TAttributes | null): TContainerNode {
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'container nodes should be created before any bindings');

  const adjustedIndex = nodeIndex + HEADER_OFFSET;
  ngDevMode && assertDataInRange(lView, nodeIndex + HEADER_OFFSET);
  ngDevMode && ngDevMode.rendererCreateComment++;
  const comment = lView[adjustedIndex] =
      lView[RENDERER].createComment(ngDevMode ? 'container' : '');
  const tNode =
      getOrCreateTNode(lView[TVIEW], lView[T_HOST], nodeIndex, TNodeType.Container, tagName, attrs);
  const lContainer = lView[adjustedIndex] = createLContainer(comment, lView, comment, tNode);

  appendChild(comment, tNode, lView);

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(lView, lContainer);

  ngDevMode && assertNodeType(getPreviousOrParentTNode(), TNodeType.Container);
  return tNode;
}
