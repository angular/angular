/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertEqual} from '../../util/assert';
import {assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {executePreOrderHooks, registerPostOrderHooks} from '../hooks';
import {ACTIVE_INDEX, VIEWS} from '../interfaces/container';
import {ComponentTemplate} from '../interfaces/definition';
import {LocalRefExtractor, TAttributes, TContainerNode, TNode, TNodeType} from '../interfaces/node';
import {BINDING_INDEX, HEADER_OFFSET, LView, QUERIES, RENDERER, TVIEW} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild, removeView} from '../node_manipulation';
import {getCheckNoChangesMode, getIsParent, getLView, getPreviousOrParentTNode, setIsParent, setPreviousOrParentTNode} from '../state';
import {getNativeByTNode, loadInternal} from '../util/view_utils';
import {addToViewTree, createDirectivesAndLocals, createLContainer, createNodeAtIndex, createTView} from './shared';

/**
 * Creates an LContainer for inline views, e.g.
 *
 * % if (showing) {
 *   <div></div>
 * % }
 *
 * @param index The index of the container in the data array
 */
export function container(index: number): void {
  const tNode = containerInternal(index, null, null);
  const lView = getLView();
  if (lView[TVIEW].firstTemplatePass) {
    tNode.tViews = [];
  }
  addTContainerToQueries(lView, tNode);
  setIsParent(false);
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
 */
export function template(
    index: number, templateFn: ComponentTemplate<any>| null, consts: number, vars: number,
    tagName?: string | null, attrs?: TAttributes | null, localRefs?: string[] | null,
    localRefExtractor?: LocalRefExtractor) {
  const lView = getLView();
  const tView = lView[TVIEW];

  // TODO: consider a separate node type for templates
  const tContainerNode = containerInternal(index, tagName || null, attrs || null);
  if (tView.firstTemplatePass) {
    tContainerNode.tViews = createTView(
        -1, templateFn, consts, vars, tView.directiveRegistry, tView.pipeRegistry, null, null);
  }

  createDirectivesAndLocals(tView, lView, localRefs, localRefExtractor);
  addTContainerToQueries(lView, tContainerNode);
  attachPatchData(getNativeByTNode(tContainerNode, lView), lView);
  registerPostOrderHooks(tView, tContainerNode);
  setIsParent(false);
}

/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export function containerRefreshStart(index: number): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  let previousOrParentTNode = loadInternal(tView.data, index) as TNode;
  setPreviousOrParentTNode(previousOrParentTNode);

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);
  setIsParent(true);

  lView[index + HEADER_OFFSET][ACTIVE_INDEX] = 0;

  // We need to execute init hooks here so ngOnInit hooks are called in top level views
  // before they are called in embedded views (for backwards compatibility).
  executePreOrderHooks(lView, tView, getCheckNoChangesMode(), undefined);
}

/**
 * Marks the end of the LContainer.
 *
 * Marking the end of LContainer is the time when to child views get inserted or removed.
 */
export function containerRefreshEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  if (getIsParent()) {
    setIsParent(false);
  } else {
    ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.View);
    ngDevMode && assertHasParent(previousOrParentTNode);
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);

  const lContainer = getLView()[previousOrParentTNode.index];
  const nextIndex = lContainer[ACTIVE_INDEX];

  // remove extra views at the end of the container
  while (nextIndex < lContainer[VIEWS].length) {
    removeView(lContainer, nextIndex);
  }
}

/**
* Reporting a TContainer node queries is a 2-step process as we need to:
* - check if the container node itself is matching (query might match a <ng-template> node);
* - prepare room for nodes from views that might be created based on the TemplateRef linked to this
* container.
*
* Those 2 operations need to happen in the specific order (match the container node itself, then
* prepare space for nodes from views).
*/
function addTContainerToQueries(lView: LView, tContainerNode: TContainerNode): void {
  const queries = lView[QUERIES];
  if (queries) {
    queries.addNode(tContainerNode);
    const lContainer = lView[tContainerNode.index];
    lContainer[QUERIES] = queries.container();
  }
}

function containerInternal(
    index: number, tagName: string | null, attrs: TAttributes | null): TContainerNode {
  const lView = getLView();
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'container nodes should be created before any bindings');

  const adjustedIndex = index + HEADER_OFFSET;
  const comment = lView[RENDERER].createComment(ngDevMode ? 'container' : '');
  ngDevMode && ngDevMode.rendererCreateComment++;
  const tNode = createNodeAtIndex(index, TNodeType.Container, comment, tagName, attrs);
  const lContainer = lView[adjustedIndex] =
      createLContainer(lView[adjustedIndex], lView, comment, tNode);

  appendChild(comment, tNode, lView);

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(lView, lContainer);

  ngDevMode && assertNodeType(getPreviousOrParentTNode(), TNodeType.Container);
  return tNode;
}
