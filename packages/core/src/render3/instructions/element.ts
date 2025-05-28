/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  invalidSkipHydrationHost,
  validateMatchingNode,
  validateNodeExists,
} from '../../hydration/error_handling';
import {locateNextRNode} from '../../hydration/node_lookup_utils';
import {
  hasSkipHydrationAttrOnRElement,
  hasSkipHydrationAttrOnTNode,
} from '../../hydration/skip_hydration';
import {
  canHydrateNode,
  getSerializedContainerViews,
  markRNodeAsClaimedByHydration,
  markRNodeAsSkippedByHydration,
  setSegmentHead,
} from '../../hydration/utils';
import {assertDefined} from '../../util/assert';
import {assertTNodeCreationIndex} from '../assert';
import {clearElementContents, createElementNode} from '../dom_node_manipulation';
import {hasClassInput, hasStyleInput, TElementNode, TNode, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {isComponentHost, isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TVIEW, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {executeContentQueries} from '../queries/query_execution';
import {
  decreaseElementDepthCount,
  enterSkipHydrationBlock,
  getBindingsEnabled,
  getCurrentTNode,
  getLView,
  getNamespace,
  getTView,
  isSkipHydrationRootTNode,
  lastNodeWasCreated,
  leaveSkipHydrationBlock,
} from '../state';
import {
  directiveHostEndFirstCreatePass,
  directiveHostFirstCreatePass,
  domOnlyFirstCreatePass,
} from '../view/elements';

import {validateElementIsKnown} from './element_validation';
import {setDirectiveInputsWhichShadowsStyling} from './property';
import {
  createDirectivesInstances,
  elementLikeEndShared,
  elementLikeStartShared,
  findDirectiveDefMatches,
  saveResolvedLocalsInData,
} from './shared';

/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 *
 * @codeGenApi
 */
export function ɵɵelementStart(
  index: number,
  name: string,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵelementStart {
  const lView = getLView();

  ngDevMode && assertTNodeCreationIndex(lView, index);

  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass
    ? directiveHostFirstCreatePass(
        adjustedIndex,
        lView,
        TNodeType.Element,
        name,
        findDirectiveDefMatches,
        getBindingsEnabled(),
        attrsIndex,
        localRefsIndex,
      )
    : (tView.data[adjustedIndex] as TElementNode);

  elementLikeStartShared(tNode, lView, index, name, _locateOrCreateElementNode);

  if (isDirectiveHost(tNode)) {
    const tView = lView[TVIEW];
    createDirectivesInstances(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }

  if (ngDevMode && lView[TVIEW].firstCreatePass) {
    validateElementIsKnown(lView, tNode);
  }

  return ɵɵelementStart;
}

/**
 * Mark the end of the element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵelementEnd(): typeof ɵɵelementEnd {
  const tView = getTView();
  const initialTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(initialTNode, 'No parent node to close.');

  const currentTNode = elementLikeEndShared(initialTNode);
  ngDevMode && assertTNodeType(currentTNode, TNodeType.AnyRNode);

  if (tView.firstCreatePass) {
    directiveHostEndFirstCreatePass(tView, currentTNode);
  }

  if (isSkipHydrationRootTNode(currentTNode)) {
    leaveSkipHydrationBlock();
  }

  decreaseElementDepthCount();

  if (currentTNode.classesWithoutHost != null && hasClassInput(currentTNode)) {
    setDirectiveInputsWhichShadowsStyling(
      tView,
      currentTNode,
      getLView(),
      currentTNode.classesWithoutHost,
      true,
    );
  }

  if (currentTNode.stylesWithoutHost != null && hasStyleInput(currentTNode)) {
    setDirectiveInputsWhichShadowsStyling(
      tView,
      currentTNode,
      getLView(),
      currentTNode.stylesWithoutHost,
      false,
    );
  }
  return ɵɵelementEnd;
}

/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵelement(
  index: number,
  name: string,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵelement {
  ɵɵelementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵelementEnd();
  return ɵɵelement;
}

/**
 * Create DOM element that cannot have any directives.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵdomElementStart(
  index: number,
  name: string,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵdomElementStart {
  const lView = getLView();

  ngDevMode && assertTNodeCreationIndex(lView, index);

  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass
    ? domOnlyFirstCreatePass(adjustedIndex, tView, TNodeType.Element, name, attrsIndex)
    : (tView.data[adjustedIndex] as TElementNode);

  elementLikeStartShared(tNode, lView, index, name, _locateOrCreateElementNode);

  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }

  if (ngDevMode && lView[TVIEW].firstCreatePass) {
    validateElementIsKnown(lView, tNode);
  }

  return ɵɵdomElementStart;
}

/**
 * Mark the end of the directiveless element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵdomElementEnd(): typeof ɵɵdomElementEnd {
  const initialTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(initialTNode, 'No parent node to close.');

  const currentTNode = elementLikeEndShared(initialTNode);
  ngDevMode && assertTNodeType(currentTNode, TNodeType.AnyRNode);

  if (isSkipHydrationRootTNode(currentTNode)) {
    leaveSkipHydrationBlock();
  }

  decreaseElementDepthCount();

  return ɵɵdomElementEnd;
}

/**
 * Creates an empty element using {@link domElementStart} and {@link domElementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export function ɵɵdomElement(
  index: number,
  name: string,
  attrsIndex?: number | null,
  localRefsIndex?: number,
): typeof ɵɵdomElement {
  ɵɵdomElementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵdomElementEnd();
  return ɵɵdomElement;
}

let _locateOrCreateElementNode: typeof locateOrCreateElementNodeImpl = (
  tView: TView,
  lView: LView,
  tNode: TNode,
  name: string,
  index: number,
) => {
  lastNodeWasCreated(true);
  return createElementNode(lView[RENDERER], name, getNamespace());
};

/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode of element nodes.
 */
function locateOrCreateElementNodeImpl(
  tView: TView,
  lView: LView,
  tNode: TNode,
  name: string,
  index: number,
): RElement {
  const isNodeCreationMode = !canHydrateNode(lView, tNode);
  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createElementNode(lView[RENDERER], name, getNamespace());
  }

  // Hydration mode, looking up an existing element in DOM.
  const hydrationInfo = lView[HYDRATION]!;
  const native = locateNextRNode<RElement>(hydrationInfo, tView, lView, tNode)!;
  ngDevMode && validateMatchingNode(native, Node.ELEMENT_NODE, name, lView, tNode);
  ngDevMode && markRNodeAsClaimedByHydration(native);

  // This element might also be an anchor of a view container.
  if (getSerializedContainerViews(hydrationInfo, index)) {
    // Important note: this element acts as an anchor, but it's **not** a part
    // of the embedded view, so we start the segment **after** this element, taking
    // a reference to the next sibling. For example, the following template:
    // `<div #vcrTarget>` is represented in the DOM as `<div></div>...<!--container-->`,
    // so while processing a `<div>` instruction, point to the next sibling as a
    // start of a segment.
    ngDevMode && validateNodeExists(native.nextSibling, lView, tNode);
    setSegmentHead(hydrationInfo, index, native.nextSibling);
  }

  // Checks if the skip hydration attribute is present during hydration so we know to
  // skip attempting to hydrate this block. We check both TNode and RElement for an
  // attribute: the RElement case is needed for i18n cases, when we add it to host
  // elements during the annotation phase (after all internal data structures are setup).
  if (
    hydrationInfo &&
    (hasSkipHydrationAttrOnTNode(tNode) || hasSkipHydrationAttrOnRElement(native))
  ) {
    if (isComponentHost(tNode)) {
      enterSkipHydrationBlock(tNode);

      // Since this isn't hydratable, we need to empty the node
      // so there's no duplicate content after render
      clearElementContents(native);

      ngDevMode && markRNodeAsSkippedByHydration(native);
    } else if (ngDevMode) {
      // If this is not a component host, throw an error.
      // Hydration can be skipped on per-component basis only.
      throw invalidSkipHydrationHost(native);
    }
  }
  return native;
}

export function enableLocateOrCreateElementNodeImpl() {
  _locateOrCreateElementNode = locateOrCreateElementNodeImpl;
}
