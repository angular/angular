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
import {executeCheckHooks, executeInitAndCheckHooks, incrementInitPhaseFlags, registerPostOrderHooks} from '../hooks';
import {ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {ComponentTemplate} from '../interfaces/definition';
import {LocalRefExtractor, TAttributes, TContainerNode, TNode, TNodeType, TViewNode} from '../interfaces/node';
import {isDirectiveHost} from '../interfaces/type_checks';
import {FLAGS, HEADER_OFFSET, InitPhaseState, LView, LViewFlags, RENDERER, TVIEW, TViewType, T_HOST} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild, removeView} from '../node_manipulation';
import {getBindingIndex, getCheckNoChangesMode, getIsParent, getLView, getPreviousOrParentTNode, setIsNotParent, setPreviousOrParentTNode} from '../state';
import {getConstant, load} from '../util/view_utils';

import {addToViewTree, createDirectivesInstances, createLContainer, createTNode, createTView, getOrCreateTNode, resolveDirectives, saveResolvedLocalsInData} from './shared';



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

  if (lView[TVIEW].firstCreatePass) {
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
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 *
 * @codeGenApi
 */
export function ɵɵtemplate(
    index: number, templateFn: ComponentTemplate<any>| null, decls: number, vars: number,
    tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null,
    localRefExtractor?: LocalRefExtractor) {
  const lView = getLView();
  const tView = lView[TVIEW];
  const tViewConsts = tView.consts;

  // TODO: consider a separate node type for templates
  const tContainerNode = containerInternal(
      lView, index, tagName || null, getConstant<TAttributes>(tViewConsts, attrsIndex));
  const localRefs = getConstant<string[]>(tViewConsts, localRefsIndex);
  if (tView.firstCreatePass) {
    ngDevMode && ngDevMode.firstCreatePass++;
    resolveDirectives(tView, lView, tContainerNode, localRefs);
    registerPostOrderHooks(tView, tContainerNode);

    const embeddedTView = tContainerNode.tViews = createTView(
        TViewType.Embedded, -1, templateFn, decls, vars, tView.directiveRegistry,
        tView.pipeRegistry, null, tView.schemas, tViewConsts);
    const embeddedTViewNode = createTNode(tView, null, TNodeType.View, -1, null, null) as TViewNode;
    embeddedTViewNode.injectorIndex = tContainerNode.injectorIndex;
    embeddedTView.node = embeddedTViewNode;

    if (tView.queries !== null) {
      tView.queries.template(tView, tContainerNode);
      embeddedTView.queries = tView.queries.embeddedTView(tContainerNode);
    }
  }

  if (isDirectiveHost(tContainerNode)) {
    createDirectivesInstances(tView, lView, tContainerNode);
  }
  if (localRefs != null) {
    saveResolvedLocalsInData(lView, tContainerNode, localRefExtractor);
  }

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
  let previousOrParentTNode = load(tView.data, index) as TNode;
  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);
  setPreviousOrParentTNode(previousOrParentTNode, true);

  lView[index + HEADER_OFFSET][ACTIVE_INDEX] = 0;

  // We need to execute init hooks here so ngOnInit hooks are called in top level views
  // before they are called in embedded views (for backwards compatibility).
  if (!getCheckNoChangesMode()) {
    const hooksInitPhaseCompleted =
        (lView[FLAGS] & LViewFlags.InitPhaseStateMask) === InitPhaseState.InitPhaseCompleted;
    if (hooksInitPhaseCompleted) {
      const preOrderCheckHooks = tView.preOrderCheckHooks;
      if (preOrderCheckHooks !== null) {
        executeCheckHooks(lView, preOrderCheckHooks, null);
      }
    } else {
      const preOrderHooks = tView.preOrderHooks;
      if (preOrderHooks !== null) {
        executeInitAndCheckHooks(lView, preOrderHooks, InitPhaseState.OnInitHooksToBeRun, null);
      }
      incrementInitPhaseFlags(lView, InitPhaseState.OnInitHooksToBeRun);
    }
  }
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
                   getBindingIndex(), lView[TVIEW].bindingStartIndex,
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
  attachPatchData(comment, lView);

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(lView, lContainer);

  ngDevMode && assertNodeType(getPreviousOrParentTNode(), TNodeType.Container);
  return tNode;
}
