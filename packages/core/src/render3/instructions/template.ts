/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {validateMatchingNode, validateNodeExists} from '../../hydration/error_handling';
import {TEMPLATES} from '../../hydration/interfaces';
import {locateNextRNode, siblingAfter} from '../../hydration/node_lookup_utils';
import {
  calcSerializedContainerSize,
  canHydrateNode,
  markRNodeAsClaimedByHydration,
  setSegmentHead,
} from '../../hydration/utils';
import {populateDehydratedViewsInLContainer} from '../../linker/view_container_ref';
import {assertEqual} from '../../util/assert';
import {assertFirstCreatePass} from '../assert';
import {attachPatchData} from '../context_discovery';
import {registerPostOrderHooks} from '../hooks';
import {ComponentTemplate} from '../interfaces/definition';
import {
  LocalRefExtractor,
  TAttributes,
  TContainerNode,
  TNode,
  TNodeFlags,
  TNodeType,
} from '../interfaces/node';
import {RComment} from '../interfaces/renderer_dom';
import {isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TView, TViewType} from '../interfaces/view';
import {appendChild} from '../node_manipulation';
import {
  getBindingsEnabled,
  getLView,
  getTView,
  isInSkipHydrationBlock,
  lastNodeWasCreated,
  setCurrentTNode,
  wasLastNodeCreated,
} from '../state';
import {getOrCreateTNode} from '../tnode_manipulation';
import {mergeHostAttrs} from '../util/attrs_utils';
import {getConstant} from '../util/view_utils';
import {addToEndOfViewTree, createTView} from '../view/construction';
import {createLContainer} from '../view/container';
import {resolveDirectives} from '../view/directives';

import {
  createDirectivesInstances,
  findDirectiveDefMatches,
  saveResolvedLocalsInData,
} from './shared';

function templateFirstCreatePass(
  index: number,
  tView: TView,
  lView: LView,
  templateFn: ComponentTemplate<any> | null,
  decls: number,
  vars: number,
  tagName?: string | null,
  attrs?: TAttributes | null,
  localRefsIndex?: number | null,
): TContainerNode {
  ngDevMode && assertFirstCreatePass(tView);
  const tViewConsts = tView.consts;

  // TODO(pk): refactor getOrCreateTNode to have the "create" only version
  const tNode = getOrCreateTNode(tView, index, TNodeType.Container, tagName || null, attrs || null);

  if (getBindingsEnabled()) {
    resolveDirectives(
      tView,
      lView,
      tNode,
      getConstant<string[]>(tViewConsts, localRefsIndex),
      findDirectiveDefMatches,
    );
  }

  // Merge the template attrs last so that they have the highest priority.
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);

  registerPostOrderHooks(tView, tNode);

  const embeddedTView = (tNode.tView = createTView(
    TViewType.Embedded,
    tNode,
    templateFn,
    decls,
    vars,
    tView.directiveRegistry,
    tView.pipeRegistry,
    null,
    tView.schemas,
    tViewConsts,
    null /* ssrId */,
  ));

  if (tView.queries !== null) {
    tView.queries.template(tView, tNode);
    embeddedTView.queries = tView.queries.embeddedTView(tNode);
  }

  return tNode;
}

/**
 * Creates an LContainer for an embedded view.
 *
 * @param declarationLView LView in which the template was declared.
 * @param declarationTView TView in which the template wa declared.
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 */
export function declareTemplate(
  declarationLView: LView,
  declarationTView: TView,
  index: number,
  templateFn: ComponentTemplate<any> | null,
  decls: number,
  vars: number,
  tagName?: string | null,
  attrs?: TAttributes | null,
  flags?: TNodeFlags,
  localRefsIndex?: number | null,
  localRefExtractor?: LocalRefExtractor,
): TNode {
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = declarationTView.firstCreatePass
    ? templateFirstCreatePass(
        adjustedIndex,
        declarationTView,
        declarationLView,
        templateFn,
        decls,
        vars,
        tagName,
        attrs,
        localRefsIndex,
      )
    : (declarationTView.data[adjustedIndex] as TContainerNode);

  if (flags) {
    tNode.flags |= flags;
  }
  setCurrentTNode(tNode, false);

  const comment = _locateOrCreateContainerAnchor(
    declarationTView,
    declarationLView,
    tNode,
    index,
  ) as RComment;

  if (wasLastNodeCreated()) {
    appendChild(declarationTView, declarationLView, comment, tNode);
  }
  attachPatchData(comment, declarationLView);

  const lContainer = createLContainer(comment, declarationLView, comment, tNode);
  declarationLView[adjustedIndex] = lContainer;
  addToEndOfViewTree(declarationLView, lContainer);

  // If hydration is enabled, looks up dehydrated views in the DOM
  // using hydration annotation info and stores those views on LContainer.
  // In client-only mode, this function is a noop.
  populateDehydratedViewsInLContainer(lContainer, tNode, declarationLView);

  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(declarationTView, declarationLView, tNode);
  }

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(declarationLView, tNode, localRefExtractor);
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
  index: number,
  templateFn: ComponentTemplate<any> | null,
  decls: number,
  vars: number,
  tagName?: string | null,
  attrsIndex?: number | null,
  localRefsIndex?: number | null,
  localRefExtractor?: LocalRefExtractor,
): typeof ɵɵtemplate {
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant<TAttributes>(tView.consts, attrsIndex);
  declareTemplate(
    lView,
    tView,
    index,
    templateFn,
    decls,
    vars,
    tagName,
    attrs,
    undefined,
    localRefsIndex,
    localRefExtractor,
  );
  return ɵɵtemplate;
}

let _locateOrCreateContainerAnchor = createContainerAnchorImpl;

/**
 * Regular creation mode for LContainers and their anchor (comment) nodes.
 */
function createContainerAnchorImpl(
  tView: TView,
  lView: LView,
  tNode: TNode,
  index: number,
): RComment {
  lastNodeWasCreated(true);
  return lView[RENDERER].createComment(ngDevMode ? 'container' : '');
}

/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode for LContainers and their
 * anchor (comment) nodes.
 */
function locateOrCreateContainerAnchorImpl(
  tView: TView,
  lView: LView,
  tNode: TNode,
  index: number,
): RComment {
  const isNodeCreationMode = !canHydrateNode(lView, tNode);
  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createContainerAnchorImpl(tView, lView, tNode, index);
  }

  const hydrationInfo = lView[HYDRATION]!;
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
  ngDevMode && validateNodeExists(currentRNode, lView, tNode);

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
