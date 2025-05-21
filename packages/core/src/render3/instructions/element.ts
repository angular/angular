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
import {assertDefined, assertEqual} from '../../util/assert';
import {clearElementContents, createElementNode} from '../dom_node_manipulation';
import {hasClassInput, hasStyleInput, TNode, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {isComponentHost, isDirectiveHost} from '../interfaces/type_checks';
import {HYDRATION, LView, RENDERER, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {
  decreaseElementDepthCount,
  enterSkipHydrationBlock,
  getBindingIndex,
  getBindingsEnabled,
  getCurrentTNode,
  getLView,
  getNamespace,
  getTView,
  isSkipHydrationRootTNode,
  lastNodeWasCreated,
  leaveSkipHydrationBlock,
} from '../state';

import {validateElementIsKnown} from './element_validation';
import {setDirectiveInputsWhichShadowsStyling} from './property';
import {elementLikeEndShared, elementLikeStartShared} from './shared';

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
  ngDevMode &&
    assertEqual(
      getBindingIndex(),
      tView.bindingStartIndex,
      'elements should be created before any bindings',
    );
  const tNode = elementLikeStartShared(
    lView,
    index,
    TNodeType.Element,
    name,
    _locateOrCreateElementNode,
    getBindingsEnabled(),
    attrsIndex,
    localRefsIndex,
  );

  if (ngDevMode && tView.firstCreatePass) {
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

  const currentTNode = elementLikeEndShared(tView, initialTNode);
  ngDevMode && assertTNodeType(currentTNode, TNodeType.AnyRNode);

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
