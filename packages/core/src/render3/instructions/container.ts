/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange, assertEqual} from '../../util/assert';
import {assertFirstCreatePass, assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {executeCheckHooks, executeInitAndCheckHooks, incrementInitPhaseFlags, registerPostOrderHooks} from '../hooks';
import {ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {ComponentTemplate} from '../interfaces/definition';
import {LocalRefExtractor, TAttributes, TContainerNode, TNode, TNodeType, TViewNode} from '../interfaces/node';
import {isDirectiveHost} from '../interfaces/type_checks';
import {FLAGS, HEADER_OFFSET, InitPhaseState, LView, LViewFlags, RENDERER, T_HOST, TView, TViewType} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {appendChild, removeView} from '../node_manipulation';
import {getBindingIndex, getCheckNoChangesMode, getIsParent, getLView, getPreviousOrParentTNode, getTView, setIsNotParent, setPreviousOrParentTNode} from '../state';
import {getConstant, getLContainerActiveIndex, load} from '../util/view_utils';

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
  const tView = getTView();
  const tNode = containerInternal(tView, lView, index, null, null);

  if (tView.firstCreatePass) {
    tNode.tViews = [];
  }
  setIsNotParent();
}

function templateFirstCreatePass(
    index: number, tView: TView, lView: LView, templateFn: ComponentTemplate<any>|null,
    decls: number, vars: number, tagName?: string|null, attrsIndex?: number|null,
    localRefsIndex?: number|null): TContainerNode {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;
  const tViewConsts = tView.consts;
  // TODO(pk): refactor getOrCreateTNode to have the "create" only version
  const tNode = getOrCreateTNode(
      tView, lView[T_HOST], index, TNodeType.Container, tagName || null,
      getConstant<TAttributes>(tViewConsts, attrsIndex));

  resolveDirectives(tView, lView, tNode, getConstant<string[]>(tViewConsts, localRefsIndex));
  registerPostOrderHooks(tView, tNode);

  const embeddedTView = tNode.tViews = createTView(
      TViewType.Embedded, -1, templateFn, decls, vars, tView.directiveRegistry, tView.pipeRegistry,
      null, tView.schemas, tViewConsts);
  const embeddedTViewNode = createTNode(tView, null, TNodeType.View, -1, null, null) as TViewNode;
  embeddedTViewNode.injectorIndex = tNode.injectorIndex;
  embeddedTView.node = embeddedTViewNode;

  if (tView.queries !== null) {
    tView.queries.template(tView, tNode);
    embeddedTView.queries = tView.queries.embeddedTView(tNode);
  }

  return tNode;
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
    index: number, templateFn: ComponentTemplate<any>|null, decls: number, vars: number,
    tagName?: string|null, attrsIndex?: number|null, localRefsIndex?: number|null,
    localRefExtractor?: LocalRefExtractor) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;

  const tNode = tView.firstCreatePass ?
      templateFirstCreatePass(
          index, tView, lView, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex) :
      tView.data[adjustedIndex] as TContainerNode;
  setPreviousOrParentTNode(tNode, false);

  const comment = lView[RENDERER].createComment(ngDevMode ? 'container' : '');
  appendChild(tView, lView, comment, tNode);
  attachPatchData(comment, lView);

  addToViewTree(lView, lView[adjustedIndex] = createLContainer(comment, lView, comment, tNode));

  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(tView, lView, tNode);
  }

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode, localRefExtractor);
  }
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
  const tView = getTView();
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
    previousOrParentTNode = previousOrParentTNode.parent!;
    setPreviousOrParentTNode(previousOrParentTNode, false);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);

  const lContainer: LContainer = getLView()[previousOrParentTNode.index];
  const nextIndex = getLContainerActiveIndex(lContainer);

  // remove extra views at the end of the container
  while (nextIndex < lContainer.length - CONTAINER_HEADER_OFFSET) {
    removeView(lContainer, nextIndex);
  }
}

function containerInternal(
    tView: TView, lView: LView, nodeIndex: number, tagName: string|null,
    attrs: TAttributes|null): TContainerNode {
  ngDevMode &&
      assertEqual(
          getBindingIndex(), tView.bindingStartIndex,
          'container nodes should be created before any bindings');

  const adjustedIndex = nodeIndex + HEADER_OFFSET;
  ngDevMode && assertDataInRange(lView, nodeIndex + HEADER_OFFSET);
  ngDevMode && ngDevMode.rendererCreateComment++;
  const comment = lView[adjustedIndex] =
      lView[RENDERER].createComment(ngDevMode ? 'container' : '');
  const tNode =
      getOrCreateTNode(tView, lView[T_HOST], nodeIndex, TNodeType.Container, tagName, attrs);
  const lContainer = lView[adjustedIndex] = createLContainer(comment, lView, comment, tNode);

  appendChild(tView, lView, comment, tNode);
  attachPatchData(comment, lView);

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(lView, lContainer);

  ngDevMode && assertNodeType(getPreviousOrParentTNode(), TNodeType.Container);
  return tNode;
}