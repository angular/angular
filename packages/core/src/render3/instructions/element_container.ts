/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {validateMatchingNode, validateNodeExists} from '../../hydration/error_handling';
import {locateNextRNode, siblingAfter} from '../../hydration/node_lookup_utils';
import {
  getNgContainerSize,
  isDisconnectedNode,
  markRNodeAsClaimedByHydration,
  setSegmentHead,
} from '../../hydration/utils';
import {isDetachedByI18n} from '../../i18n/utils';
import {assertEqual, assertIndexInRange, assertNumber} from '../../util/assert';
import {assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {registerPostOrderHooks} from '../hooks';
import {TAttributes, TElementContainerNode, TNode, TNodeType} from '../interfaces/node';
import {RComment} from '../interfaces/renderer_dom';
import {isContentQueryHost, isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {executeContentQueries} from '../queries/query_execution';
import {appendChild} from '../node_manipulation';
import {createCommentNode} from '../dom_node_manipulation';
import {
  getBindingIndex,
  getBindingsEnabled,
  getCurrentTNode,
  getLView,
  getTView,
  isCurrentTNodeParent,
  isInSkipHydrationBlock,
  lastNodeWasCreated,
  setCurrentTNode,
  setCurrentTNodeAsNotParent,
  wasLastNodeCreated,
} from '../state';
import {computeStaticStyling} from '../styling/static_styling';
import {mergeHostAttrs} from '../util/attrs_utils';
import {getConstant} from '../util/view_utils';

import {
  createDirectivesInstancesInInstruction,
  findDirectiveDefMatches,
  saveResolvedLocalsInData,
} from './shared';
import {getOrCreateTNode} from '../tnode_manipulation';
import {resolveDirectives} from '../view/directives';

function elementContainerStartFirstCreatePass(
  index: number,
  tView: TView,
  lView: LView,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): TElementContainerNode {
  ngDevMode && ngDevMode.firstCreatePass++;

  const tViewConsts = tView.consts;
  const attrs = getConstant<TAttributes>(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, TNodeType.ElementContainer, 'ng-container', attrs);

  // While ng-container doesn't necessarily support styling, we use the style context to identify
  // and execute directives on the ng-container.
  if (attrs !== null) {
    computeStaticStyling(tNode, attrs, true);
  }

  const localRefs = getConstant<string[]>(tViewConsts, localRefsIndex);
  if (getBindingsEnabled()) {
    resolveDirectives(tView, lView, tNode, localRefs, findDirectiveDefMatches);
  }

  // Merge the template attrs last so that they have the highest priority.
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);

  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }

  return tNode;
}

/**
 * Creates a logical container for other nodes (<ng-container>) backed by a comment node in the DOM.
 * The instruction must later be followed by `elementContainerEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * Even if this instruction accepts a set of attributes no actual attribute values are propagated to
 * the DOM (as a comment node can't have attributes). Attributes are here only for directive
 * matching purposes and setting initial inputs of directives.
 *
 * @codeGenApi
 */
export function ɵɵelementContainerStart(
  index: number,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵelementContainerStart {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;

  ngDevMode && assertIndexInRange(lView, adjustedIndex);
  ngDevMode &&
    assertEqual(
      getBindingIndex(),
      tView.bindingStartIndex,
      'element containers should be created before any bindings',
    );

  const tNode = tView.firstCreatePass
    ? elementContainerStartFirstCreatePass(adjustedIndex, tView, lView, attrsIndex, localRefsIndex)
    : (tView.data[adjustedIndex] as TElementContainerNode);
  setCurrentTNode(tNode, true);

  const comment = _locateOrCreateElementContainerNode(tView, lView, tNode, index);
  lView[adjustedIndex] = comment;

  if (wasLastNodeCreated()) {
    appendChild(tView, lView, comment, tNode);
  }
  attachPatchData(comment, lView);

  if (isDirectiveHost(tNode)) {
    createDirectivesInstancesInInstruction(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }

  return ɵɵelementContainerStart;
}

/**
 * Mark the end of the <ng-container>.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵelementContainerEnd(): typeof ɵɵelementContainerEnd {
  let currentTNode = getCurrentTNode()!;
  const tView = getTView();
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(currentTNode);
    currentTNode = currentTNode.parent!;
    setCurrentTNode(currentTNode, false);
  }

  ngDevMode && assertTNodeType(currentTNode, TNodeType.ElementContainer);

  if (tView.firstCreatePass) {
    registerPostOrderHooks(tView, currentTNode);
    if (isContentQueryHost(currentTNode)) {
      tView.queries!.elementEnd(currentTNode);
    }
  }
  return ɵɵelementContainerEnd;
}

/**
 * Creates an empty logical container using {@link elementContainerStart}
 * and {@link elementContainerEnd}
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵelementContainer(
  index: number,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵelementContainer {
  ɵɵelementContainerStart(index, attrsIndex, localRefsIndex);
  ɵɵelementContainerEnd();
  return ɵɵelementContainer;
}

let _locateOrCreateElementContainerNode: typeof locateOrCreateElementContainerNode = (
  tView: TView,
  lView: LView,
  tNode: TNode,
  index: number,
) => {
  lastNodeWasCreated(true);
  return createCommentNode(lView[RENDERER], ngDevMode ? 'ng-container' : '');
};

/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode of comment nodes that
 * represent <ng-container>'s anchor.
 */
function locateOrCreateElementContainerNode(
  tView: TView,
  lView: LView,
  tNode: TNode,
  index: number,
): RComment {
  let comment: RComment;
  const hydrationInfo = lView[HYDRATION];
  const isNodeCreationMode =
    !hydrationInfo ||
    isInSkipHydrationBlock() ||
    isDisconnectedNode(hydrationInfo, index) ||
    isDetachedByI18n(tNode);

  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createCommentNode(lView[RENDERER], ngDevMode ? 'ng-container' : '');
  }

  // Hydration mode, looking up existing elements in DOM.
  const currentRNode = locateNextRNode(hydrationInfo, tView, lView, tNode)!;
  ngDevMode && validateNodeExists(currentRNode, lView, tNode);

  const ngContainerSize = getNgContainerSize(hydrationInfo, index) as number;
  ngDevMode &&
    assertNumber(
      ngContainerSize,
      'Unexpected state: hydrating an <ng-container>, ' + 'but no hydration info is available.',
    );

  setSegmentHead(hydrationInfo, index, currentRNode);
  comment = siblingAfter<RComment>(ngContainerSize, currentRNode)!;

  if (ngDevMode) {
    validateMatchingNode(comment, Node.COMMENT_NODE, null, lView, tNode);
    markRNodeAsClaimedByHydration(comment);
  }

  return comment;
}

export function enableLocateOrCreateElementContainerNodeImpl() {
  _locateOrCreateElementContainerNode = locateOrCreateElementContainerNode;
}
