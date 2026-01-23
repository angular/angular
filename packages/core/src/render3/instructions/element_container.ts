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
  canHydrateNode,
  getNgContainerSize,
  markRNodeAsClaimedByHydration,
  setSegmentHead,
} from '../../hydration/utils';
import {assertDefined, assertNumber} from '../../util/assert';
import {assertTNodeCreationIndex} from '../assert';
import {createCommentNode} from '../dom_node_manipulation';
import {TElementContainerNode, TNode, TNodeType} from '../interfaces/node';
import {RComment} from '../interfaces/renderer_dom';
import {isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TVIEW, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {executeContentQueries} from '../queries/query_execution';
import {
  getBindingsEnabled,
  getCurrentTNode,
  getLView,
  getTView,
  lastNodeWasCreated,
} from '../state';
import {
  directiveHostEndFirstCreatePass,
  directiveHostFirstCreatePass,
  domOnlyFirstCreatePass,
} from '../view/elements';
import {
  createDirectivesInstances,
  elementLikeEndShared,
  elementLikeStartShared,
  findDirectiveDefMatches,
  saveResolvedLocalsInData,
} from './shared';

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
  ngDevMode && assertTNodeCreationIndex(lView, index);

  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass
    ? directiveHostFirstCreatePass(
        adjustedIndex,
        lView,
        TNodeType.ElementContainer,
        'ng-container',
        findDirectiveDefMatches,
        getBindingsEnabled(),
        attrsIndex,
        localRefsIndex,
      )
    : (tView.data[adjustedIndex] as TElementContainerNode);

  elementLikeStartShared(tNode, lView, index, 'ng-container', _locateOrCreateElementContainerNode);

  if (isDirectiveHost(tNode)) {
    const tView = lView[TVIEW];
    createDirectivesInstances(tView, lView, tNode);
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
  const tView = getTView();
  const initialTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(initialTNode, 'No parent node to close.');
  const currentTNode = elementLikeEndShared(initialTNode);

  if (tView.firstCreatePass) {
    directiveHostEndFirstCreatePass(tView, currentTNode);
  }

  ngDevMode && assertTNodeType(currentTNode, TNodeType.ElementContainer);
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

/**
 * Creates a DOM-only logical container for other nodes (<ng-container>) backed by a comment node
 * in the DOM. The host node will *not* match any directives.
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵdomElementContainerStart(
  index: number,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵdomElementContainerStart {
  const lView = getLView();
  ngDevMode && assertTNodeCreationIndex(lView, index);

  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass
    ? domOnlyFirstCreatePass(
        adjustedIndex,
        tView,
        TNodeType.ElementContainer,
        'ng-container',
        attrsIndex,
        localRefsIndex,
      )
    : (tView.data[adjustedIndex] as TElementContainerNode);

  elementLikeStartShared(tNode, lView, index, 'ng-container', _locateOrCreateElementContainerNode);

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }

  return ɵɵdomElementContainerStart;
}

/**
 * Mark the end of a directiveless <ng-container>.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵdomElementContainerEnd(): typeof ɵɵelementContainerEnd {
  const initialTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(initialTNode, 'No parent node to close.');
  const currentTNode = elementLikeEndShared(initialTNode);
  ngDevMode && assertTNodeType(currentTNode, TNodeType.ElementContainer);
  return ɵɵelementContainerEnd;
}

/**
 * Creates an empty logical container using {@link domElementContainerStart}
 * and {@link domElementContainerEnd}
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵdomElementContainer(
  index: number,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵdomElementContainer {
  ɵɵdomElementContainerStart(index, attrsIndex, localRefsIndex);
  ɵɵdomElementContainerEnd();
  return ɵɵdomElementContainer;
}

let _locateOrCreateElementContainerNode: typeof locateOrCreateElementContainerNode = (
  tView: TView,
  lView: LView,
  tNode: TNode,
  commentText: string,
  index: number,
) => {
  lastNodeWasCreated(true);
  return createCommentNode(lView[RENDERER], ngDevMode ? commentText : '');
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
  commentText: string,
  index: number,
): RComment {
  let comment: RComment;
  const isNodeCreationMode = !canHydrateNode(lView, tNode);

  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createCommentNode(lView[RENDERER], ngDevMode ? commentText : '');
  }

  // Hydration mode, looking up existing elements in DOM.
  const hydrationInfo = lView[HYDRATION]!;
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
