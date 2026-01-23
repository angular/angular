/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {addToArray, removeFromArray} from '../../util/array_utils';
import {assertDefined, assertEqual} from '../../util/assert';
import {assertLContainer, assertLView} from '../assert';
import {
  CONTAINER_HEADER_OFFSET,
  LContainer,
  LContainerFlags,
  MOVED_VIEWS,
  NATIVE,
} from '../interfaces/container';
import {TNode} from '../interfaces/node';
import {RComment, RElement} from '../interfaces/renderer_dom';
import {isLView} from '../interfaces/type_checks';
import {
  DECLARATION_COMPONENT_VIEW,
  DECLARATION_LCONTAINER,
  FLAGS,
  HYDRATION,
  LView,
  LViewFlags,
  NEXT,
  PARENT,
  QUERIES,
  RENDERER,
  T_HOST,
  TView,
  TVIEW,
} from '../interfaces/view';
import {
  addViewToDOM,
  destroyLView,
  detachMovedView,
  getBeforeNodeForView,
  removeViewFromDOM,
} from '../node_manipulation';
import {updateAncestorTraversalFlagsOnAttach} from '../util/view_utils';

/**
 * Creates a LContainer, either from a container instruction, or for a ViewContainerRef.
 *
 * @param hostNative The host element for the LContainer
 * @param hostTNode The host TNode for the LContainer
 * @param currentView The parent view of the LContainer
 * @param native The native comment element
 * @param isForViewContainerRef Optional a flag indicating the ViewContainerRef case
 * @returns LContainer
 */
export function createLContainer(
  hostNative: RElement | RComment | LView,
  currentView: LView,
  native: RComment,
  tNode: TNode,
): LContainer {
  ngDevMode && assertLView(currentView);
  const lContainer: LContainer = [
    hostNative, // host native
    true, // Boolean `true` in this position signifies that this is an `LContainer`
    0, // flags
    currentView, // parent
    null, // next
    tNode, // t_host
    null, // dehydrated views
    native, // native,
    null, // view refs
    null, // moved views
  ];
  ngDevMode &&
    assertEqual(
      lContainer.length,
      CONTAINER_HEADER_OFFSET,
      'Should allocate correct number of slots for LContainer header.',
    );
  return lContainer;
}

export function getLViewFromLContainer<T>(
  lContainer: LContainer,
  index: number,
): LView<T> | undefined {
  const adjustedIndex = CONTAINER_HEADER_OFFSET + index;
  // avoid reading past the array boundaries
  if (adjustedIndex < lContainer.length) {
    const lView = lContainer[adjustedIndex];
    ngDevMode && assertLView(lView);
    return lView as LView<T>;
  }
  return undefined;
}

export function addLViewToLContainer(
  lContainer: LContainer,
  lView: LView<unknown>,
  index: number,
  addToDOM = true,
): void {
  const tView = lView[TVIEW];

  // Insert into the view tree so the new view can be change-detected
  insertView(tView, lView, lContainer, index);

  // Insert elements that belong to this view into the DOM tree
  if (addToDOM) {
    const beforeNode = getBeforeNodeForView(index, lContainer);
    const renderer = lView[RENDERER];
    const parentRNode = renderer.parentNode(lContainer[NATIVE] as RElement | RComment);
    if (parentRNode !== null) {
      addViewToDOM(tView, lContainer[T_HOST], renderer, lView, parentRNode, beforeNode);
    }
  }

  // When in hydration mode, reset the pointer to the first child in
  // the dehydrated view. This indicates that the view was hydrated and
  // further attaching/detaching should work with this view as normal.
  const hydrationInfo = lView[HYDRATION];
  if (hydrationInfo !== null && hydrationInfo.firstChild !== null) {
    hydrationInfo.firstChild = null;
  }
}

export function removeLViewFromLContainer(
  lContainer: LContainer,
  index: number,
): LView<unknown> | undefined {
  const lView = detachView(lContainer, index);
  if (lView !== undefined) {
    destroyLView(lView[TVIEW], lView);
  }
  return lView;
}

/**
 * Detaches a view from a container.
 *
 * This method removes the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param lContainer The container from which to detach a view
 * @param removeIndex The index of the view to detach
 * @returns Detached LView instance.
 */
export function detachView(lContainer: LContainer, removeIndex: number): LView | undefined {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) return;

  const indexInContainer = CONTAINER_HEADER_OFFSET + removeIndex;
  const viewToDetach = lContainer[indexInContainer];

  if (viewToDetach) {
    const declarationLContainer = viewToDetach[DECLARATION_LCONTAINER];
    if (declarationLContainer !== null && declarationLContainer !== lContainer) {
      detachMovedView(declarationLContainer, viewToDetach);
    }

    if (removeIndex > 0) {
      lContainer[indexInContainer - 1][NEXT] = viewToDetach[NEXT] as LView;
    }
    const removedLView = removeFromArray(lContainer, CONTAINER_HEADER_OFFSET + removeIndex);
    removeViewFromDOM(viewToDetach[TVIEW], viewToDetach);

    // notify query that a view has been removed
    const lQueries = removedLView[QUERIES];
    if (lQueries !== null) {
      lQueries.detachView(removedLView[TVIEW]);
    }

    viewToDetach[PARENT] = null;
    viewToDetach[NEXT] = null;
    // Unsets the attached flag
    viewToDetach[FLAGS] &= ~LViewFlags.Attached;
  }
  return viewToDetach;
}

/**
 * Inserts a view into a container.
 *
 * This adds the view to the container's array of active views in the correct
 * position. It also adds the view's elements to the DOM if the container isn't a
 * root node of another view (in that case, the view's elements will be added when
 * the container's parent view is added later).
 *
 * @param tView The `TView' of the `LView` to insert
 * @param lView The view to insert
 * @param lContainer The container into which the view should be inserted
 * @param index Which index in the container to insert the child view into
 */
function insertView(tView: TView, lView: LView, lContainer: LContainer, index: number) {
  ngDevMode && assertLView(lView);
  ngDevMode && assertLContainer(lContainer);
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const containerLength = lContainer.length;

  if (index > 0) {
    // This is a new view, we need to add it to the children.
    lContainer[indexInContainer - 1][NEXT] = lView;
  }
  if (index < containerLength - CONTAINER_HEADER_OFFSET) {
    lView[NEXT] = lContainer[indexInContainer];
    addToArray(lContainer, CONTAINER_HEADER_OFFSET + index, lView);
  } else {
    lContainer.push(lView);
    lView[NEXT] = null;
  }

  lView[PARENT] = lContainer;

  // track views where declaration and insertion points are different
  const declarationLContainer = lView[DECLARATION_LCONTAINER];
  if (declarationLContainer !== null && lContainer !== declarationLContainer) {
    trackMovedView(declarationLContainer, lView);
  }

  // notify query that a new view has been added
  const lQueries = lView[QUERIES];
  if (lQueries !== null) {
    lQueries.insertView(tView);
  }

  updateAncestorTraversalFlagsOnAttach(lView);
  // Sets the attached flag
  lView[FLAGS] |= LViewFlags.Attached;
}

/**
 * Track views created from the declaration container (TemplateRef) and inserted into a
 * different LContainer or attached directly to ApplicationRef.
 */
export function trackMovedView(declarationContainer: LContainer, lView: LView) {
  ngDevMode && assertDefined(lView, 'LView required');
  ngDevMode && assertLContainer(declarationContainer);
  const movedViews = declarationContainer[MOVED_VIEWS];
  const parent = lView[PARENT]!;
  ngDevMode && assertDefined(parent, 'missing parent');
  if (isLView(parent)) {
    declarationContainer[FLAGS] |= LContainerFlags.HasTransplantedViews;
  } else {
    const insertedComponentLView = parent[PARENT]![DECLARATION_COMPONENT_VIEW];
    ngDevMode && assertDefined(insertedComponentLView, 'Missing insertedComponentLView');
    const declaredComponentLView = lView[DECLARATION_COMPONENT_VIEW];
    ngDevMode && assertDefined(declaredComponentLView, 'Missing declaredComponentLView');
    if (declaredComponentLView !== insertedComponentLView) {
      // At this point the declaration-component is not same as insertion-component; this means that
      // this is a transplanted view. Mark the declared lView as having transplanted views so that
      // those views can participate in CD.
      declarationContainer[FLAGS] |= LContainerFlags.HasTransplantedViews;
    }
  }
  if (movedViews === null) {
    declarationContainer[MOVED_VIEWS] = [lView];
  } else {
    movedViews.push(lView);
  }
}
