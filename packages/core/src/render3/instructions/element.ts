/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
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
import {getComponentName} from '../../internal/get_closest_component_name';
import {assertDefined} from '../../util/assert';
import {assertTNodeCreationIndex} from '../assert';
import {clearElementContents, createElementNode} from '../dom_node_manipulation';
import {ComponentDef} from '../interfaces/definition';
import {hasClassInput, hasStyleInput, TElementNode, TNode, TNodeType} from '../interfaces/node';
import {RElement} from '../interfaces/renderer_dom';
import {isComponentHost, isDirectiveHost} from '../interfaces/type_checks';
import {
  ENVIRONMENT,
  HEADER_OFFSET,
  HYDRATION,
  LView,
  RENDERER,
  TVIEW,
  TView,
} from '../interfaces/view';
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

  // If the node is a component host and we have a tracing service, we need to wrap the init logic.
  if (isComponentHost(tNode)) {
    const tracingService = lView[ENVIRONMENT].tracingService;

    if (tracingService && tracingService.componentCreate) {
      const def = tView.data[tNode.directiveStart + tNode.componentOffset] as ComponentDef<{}>;

      return tracingService.componentCreate(getComponentName(def), () => {
        initializeElement(index, name, lView, tNode, localRefsIndex);
        return ɵɵelementStart;
      });
    }
  }

  initializeElement(index, name, lView, tNode, localRefsIndex);
  return ɵɵelementStart;
}

function initializeElement(
  index: number,
  name: string,
  lView: LView,
  tNode: TElementNode,
  localRefsIndex: number | undefined,
) {
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
    ? domOnlyFirstCreatePass(
        adjustedIndex,
        tView,
        TNodeType.Element,
        name,
        attrsIndex,
        localRefsIndex,
      )
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

  if (hydrationInfo) {
    // `validateMatchingNode` above would normally catch a missing node too, but it's dev-mode
    // only. Guard against it here so production throws a coded RuntimeError instead of a raw
    // TypeError when dereferencing `native` below.
    if (native == null) {
      throw new RuntimeError(
        RuntimeErrorCode.HYDRATION_MISSING_NODE,
        ngDevMode
          ? `During hydration Angular expected a "<${name}>" element at this location (tNode #${tNode.index}), but no matching DOM node was found. This usually means the client-rendered DOM no longer matches the server-rendered HTML.`
          : `<${name}>`,
      );
    }

    // `hasSkipHydrationAttrOnRElement` below calls `.hasAttribute`, which needs `native` to be
    // an Element. `validateMatchingNode` above would normally catch a wrong node type, but it's
    // dev-mode only. Guard against it here too, cheaply, so production throws a coded
    // RuntimeError instead of a raw TypeError. In production, skip the full sentence and just
    // include the mismatched node's `nodeName`/`textContent` so the error stays cheap to build.
    if ((native as unknown as Node).nodeType !== Node.ELEMENT_NODE) {
      const node = native as unknown as Node;
      // Truncate so a large text node can't blow up the error message, same as
      // `shorten()` in `hydration/error_handling.ts`.
      const textContent = node.textContent && node.textContent.slice(0, 50);
      const description = textContent ? `${node.nodeName} ("${textContent}")` : node.nodeName;
      throw new RuntimeError(
        RuntimeErrorCode.HYDRATION_NODE_MISMATCH,
        ngDevMode
          ? `During hydration Angular expected an element at this location, but found a ${description} node instead.`
          : description,
      );
    }

    // Checks if the skip hydration attribute is present during hydration so we know to
    // skip attempting to hydrate this block. We check both TNode and RElement for an
    // attribute: the RElement case is needed for i18n cases, when we add it to host
    // elements during the annotation phase (after all internal data structures are setup).
    if (hasSkipHydrationAttrOnTNode(tNode) || hasSkipHydrationAttrOnRElement(native)) {
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
  }
  return native;
}

export function enableLocateOrCreateElementNodeImpl() {
  _locateOrCreateElementNode = locateOrCreateElementNodeImpl;
}
