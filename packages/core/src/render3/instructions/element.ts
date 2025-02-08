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
  getSerializedContainerViews,
  isDisconnectedNode,
  markRNodeAsClaimedByHydration,
  markRNodeAsSkippedByHydration,
  setSegmentHead,
} from '../../hydration/utils';
import {isDetachedByI18n} from '../../i18n/utils';
import {assertDefined, assertEqual, assertIndexInRange} from '../../util/assert';
import {assertHasParent} from '../assert';
import {attachPatchData} from '../context_discovery';
import {
  clearElementContents,
  createElementNode,
  setupStaticAttributes,
} from '../dom_node_manipulation';
import {registerPostOrderHooks} from '../hooks';
import {hasClassInput, hasStyleInput, TElementNode, TNode, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';
import {isComponentHost, isContentQueryHost, isDirectiveHost} from '../interfaces/type_checks';
import {HEADER_OFFSET, HYDRATION, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {appendChild} from '../node_manipulation';
import {executeContentQueries} from '../queries/query_execution';
import {
  decreaseElementDepthCount,
  enterSkipHydrationBlock,
  getBindingIndex,
  getBindingsEnabled,
  getCurrentTNode,
  getElementDepthCount,
  getLView,
  getNamespace,
  getTView,
  increaseElementDepthCount,
  isCurrentTNodeParent,
  isInSkipHydrationBlock,
  isSkipHydrationRootTNode,
  lastNodeWasCreated,
  leaveSkipHydrationBlock,
  setCurrentTNode,
  setCurrentTNodeAsNotParent,
  wasLastNodeCreated,
} from '../state';
import {elementEndFirstCreatePass, elementStartFirstCreatePass} from '../view/elements';

import {validateElementIsKnown} from './element_validation';
import {setDirectiveInputsWhichShadowsStyling} from './property';
import {
  createDirectivesInstancesInInstruction,
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
  const tView = getTView();
  const adjustedIndex = HEADER_OFFSET + index;

  ngDevMode &&
    assertEqual(
      getBindingIndex(),
      tView.bindingStartIndex,
      'elements should be created before any bindings',
    );
  ngDevMode && assertIndexInRange(lView, adjustedIndex);

  const renderer = lView[RENDERER];
  const tNode = tView.firstCreatePass
    ? elementStartFirstCreatePass(
        adjustedIndex,
        tView,
        lView,
        name,
        findDirectiveDefMatches,
        getBindingsEnabled(),
        attrsIndex,
        localRefsIndex,
      )
    : (tView.data[adjustedIndex] as TElementNode);

  const native = _locateOrCreateElementNode(tView, lView, tNode, renderer, name, index);
  lView[adjustedIndex] = native;

  const hasDirectives = isDirectiveHost(tNode);

  if (ngDevMode && tView.firstCreatePass) {
    validateElementIsKnown(native, lView, tNode.value, tView.schemas, hasDirectives);
  }

  setCurrentTNode(tNode, true);
  setupStaticAttributes(renderer, native, tNode);

  if (!isDetachedByI18n(tNode) && wasLastNodeCreated()) {
    // In the i18n case, the translation may have removed this element, so only add it if it is not
    // detached. See `TNodeType.Placeholder` and `LFrame.inI18n` for more context.
    appendChild(tView, lView, native, tNode);
  }

  // any immediate children of a component or template container must be pre-emptively
  // monkey-patched with the component view data so that the element can be inspected
  // later on using any element discovery utility methods (see `element_discovery.ts`)
  if (getElementDepthCount() === 0) {
    attachPatchData(native, lView);
  }
  increaseElementDepthCount();

  if (hasDirectives) {
    createDirectivesInstancesInInstruction(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }
  if (localRefsIndex !== null) {
    saveResolvedLocalsInData(lView, tNode);
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
  let currentTNode = getCurrentTNode()!;
  ngDevMode && assertDefined(currentTNode, 'No parent node to close.');
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(getCurrentTNode());
    currentTNode = currentTNode.parent!;
    setCurrentTNode(currentTNode, false);
  }

  const tNode = currentTNode;
  ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode);

  if (isSkipHydrationRootTNode(tNode)) {
    leaveSkipHydrationBlock();
  }

  decreaseElementDepthCount();

  const tView = getTView();
  if (tView.firstCreatePass) {
    elementEndFirstCreatePass(tView, tNode);
  }

  if (tNode.classesWithoutHost != null && hasClassInput(tNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, tNode, getLView(), tNode.classesWithoutHost, true);
  }

  if (tNode.stylesWithoutHost != null && hasStyleInput(tNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, tNode, getLView(), tNode.stylesWithoutHost, false);
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

let _locateOrCreateElementNode: typeof locateOrCreateElementNodeImpl = (
  tView: TView,
  lView: LView,
  tNode: TNode,
  renderer: Renderer,
  name: string,
  index: number,
) => {
  lastNodeWasCreated(true);
  return createElementNode(renderer, name, getNamespace());
};

/**
 * Enables hydration code path (to lookup existing elements in DOM)
 * in addition to the regular creation mode of element nodes.
 */
function locateOrCreateElementNodeImpl(
  tView: TView,
  lView: LView,
  tNode: TNode,
  renderer: Renderer,
  name: string,
  index: number,
): RElement {
  const hydrationInfo = lView[HYDRATION];
  const isNodeCreationMode =
    !hydrationInfo ||
    isInSkipHydrationBlock() ||
    isDetachedByI18n(tNode) ||
    isDisconnectedNode(hydrationInfo, index);
  lastNodeWasCreated(isNodeCreationMode);

  // Regular creation mode.
  if (isNodeCreationMode) {
    return createElementNode(renderer, name, getNamespace());
  }

  // Hydration mode, looking up an existing element in DOM.
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
