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
import {assertDefined, assertEqual, assertNumber} from '../../util/assert';
import {createCommentNode} from '../dom_node_manipulation';
import {TNode, TNodeType} from '../interfaces/node';
import {RComment} from '../interfaces/renderer_dom';
import {HYDRATION, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {
  getBindingIndex,
  getBindingsEnabled,
  getCurrentTNode,
  getLView,
  getTView,
  lastNodeWasCreated,
} from '../state';
import {elementLikeEndShared, elementLikeStartShared} from './shared';

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
  ngDevMode &&
    assertEqual(
      getBindingIndex(),
      tView.bindingStartIndex,
      'element containers should be created before any bindings',
    );
  elementLikeStartShared(
    lView,
    index,
    TNodeType.ElementContainer,
    'ng-container',
    _locateOrCreateElementContainerNode,
    getBindingsEnabled(),
    attrsIndex,
    localRefsIndex,
  );
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
  const currentTNode = elementLikeEndShared(tView, initialTNode);
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
