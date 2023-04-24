/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {validateMatchingNode, validateNodeExists} from '../../hydration/error_handling';
import {TEMPLATES} from '../../hydration/interfaces';
import {locateNextRNode, siblingAfter} from '../../hydration/node_lookup_utils';
import {calcSerializedContainerSize, isDisconnectedNode, markRNodeAsClaimedByHydration, setSegmentHead} from '../../hydration/utils';
import {assertEqual} from '../../util/assert';
import {assertFirstCreatePass} from '../assert';
import {attachPatchData} from '../context_discovery';
import {registerPostOrderHooks} from '../hooks';
import {ComponentTemplate} from '../interfaces/definition';
import {LocalRefExtractor, TAttributes, TContainerNode, TNode, TNodeType} from '../interfaces/node';
import {RComment} from '../interfaces/renderer_dom';
import {isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TView, TViewType} from '../interfaces/view';
import {appendChild} from '../node_manipulation';
import {getLView, getTView, isInSkipHydrationBlock, lastNodeWasCreated, setCurrentTNode, wasLastNodeCreated} from '../state';
import {getConstant} from '../util/view_utils';

import {addToViewTree, createDirectivesInstances, createLContainer, createTView, getOrCreateTNode, resolveDirectives, saveResolvedLocalsInData} from './shared';

function templateFirstCreatePass(
    index: number, tView: TView, lView: LView, templateFn: ComponentTemplate<any>|null,
    decls: number, vars: number, tagName?: string|null, attrsIndex?: number|null,
    localRefsIndex?: number|null): TContainerNode {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;
  const tViewConsts = tView.consts;

  // TODO(pk): refactor getOrCreateTNode to have the "create" only version
  const tNode = getOrCreateTNode(
      tView, index, TNodeType.Container, tagName || null,
      getConstant<TAttributes>(tViewConsts, attrsIndex));

  resolveDirectives(tView, lView, tNode, getConstant<string[]>(tViewConsts, localRefsIndex));
  registerPostOrderHooks(tView, tNode);

  const embeddedTView = tNode.tView = createTView(
      TViewType.Embedded, tNode, templateFn, decls, vars, tView.directiveRegistry,
      tView.pipeRegistry, null, tView.schemas, tViewConsts, null /* ssrId */);

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

  const tNode = tView.firstCreatePass ? templateFirstCreatePass(
                                            adjustedIndex, tView, lView, templateFn, decls, vars,
                                            tagName, attrsIndex, localRefsIndex) :
                                        tView.data[adjustedIndex] as TContainerNode;
  setCurrentTNode(tNode, false);

  const comment = _locateOrCreateContainerAnchor(tView, lView, tNode, index) as RComment;

  if (wasLastNodeCreated()) {
    appendChild(tView, lView, comment, tNode);
  }
  attachPatchData(comment, lView);

  addToViewTree(lView, lView[adjustedIndex] = createLContainer(comment, lView, comment, tNode));

  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(tView, lView, tNode);
  }

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode, localRefExtractor);
  }
}

let _locateOrCreateContainerAnchor = createContainerAnchorImpl;

/**
 * Regular creation mode for LContainers and their anchor (comment) nodes.
 */
function createContainerAnchorImpl(
    tView: TView, lView: LView, tNode: TNode, index: number): RComment {
  lastNodeWasCreated(true);
  return lView[RENDERER].createComment(ngDevMode ? 'container' : '');
}

/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode for LContainers and their
 * anchor (comment) nodes.
 */
function locateOrCreateContainerAnchorImpl(
    tView: TView, lView: LView, tNode: TNode, index: number): RComment {
  const hydrationInfo = lView[HYDRATION];
  const isNodeCreationMode =
      !hydrationInfo || isInSkipHydrationBlock() || isDisconnectedNode(hydrationInfo, index);
  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createContainerAnchorImpl(tView, lView, tNode, index);
  }

  const ssrId = hydrationInfo.data[TEMPLATES]?.[index] ?? null;

  // Apply `ssrId` value to the underlying TView if it was not previously set.
  //
  // There might be situations when the same component is present in a template
  // multiple times and some instances are opted-out of using hydration via
  // `ngSkipHydration` attribute. In this scenario, at the time a TView is created,
  // the `ssrId` might be `null` (if the first component is opted-out of hydration).
  // The code below makes sure that the `ssrId` is applied to the TView if it's still
  // `null` and verifies we never try to override it with a different value.
  if (ssrId !== null && tNode.tView !== null) {
    if (tNode.tView.ssrId === null) {
      tNode.tView.ssrId = ssrId;
    } else {
      ngDevMode &&
          assertEqual(tNode.tView.ssrId, ssrId, 'Unexpected value of the `ssrId` for this TView');
    }
  }

  // Hydration mode, looking up existing elements in DOM.
  const currentRNode = locateNextRNode(hydrationInfo, tView, lView, tNode)!;
  ngDevMode && validateNodeExists(currentRNode);

  setSegmentHead(hydrationInfo, index, currentRNode);
  const viewContainerSize = calcSerializedContainerSize(hydrationInfo, index);
  const comment = siblingAfter<RComment>(viewContainerSize, currentRNode)!;

  if (ngDevMode) {
    validateMatchingNode(comment, Node.COMMENT_NODE, null, lView, tNode);
    markRNodeAsClaimedByHydration(comment);
  }

  return comment;
}

export function enableLocateOrCreateContainerAnchorImpl() {
  _locateOrCreateContainerAnchor = locateOrCreateContainerAnchorImpl;
}
