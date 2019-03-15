/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertGreaterOrEqual} from '../util/assert';

import {assertLContainer, assertRNodeIsInView} from './assert';
import {assignTViewNodeToLView, createLContainer, createLView, createNodeAtIndex, renderEmbeddedTemplate} from './instructions/all';
import {ACTIVE_INDEX, LContainer, NATIVE, VIEWS} from './interfaces/container';
import {TNode, TNodeType} from './interfaces/node';
import {RComment, RElement, RNode} from './interfaces/renderer';
import {EmbeddedViewFactoryInternal, LView, LViewFlags, QUERIES, RENDERER, TVIEW} from './interfaces/view';
import {addRemoveViewFromContainer, attachLContainerToParentLView, destroyLView, detachView, getViewFirstNative, getViewLastNative, insertView, nativeNextSibling} from './node_manipulation';
import {getAddingEmbeddedRootChild, getIsParent, getPreviousOrParentTNode, setAddingEmbeddedRootChild, setIsParent, setPreviousOrParentTNode, shouldUseIvyAnimationCheck} from './state';
import {unwrapLContainer} from './util/view_utils';



/**
 * The internal implementation for {@link getEmbeddedViewFactory}.
 *
 * @param declarationTNode The template node where the embedded template was declared
 * @param declarationLView The local view where the embedded template was declared
 */
export function getEmbeddedViewFactoryInternal<T extends{}>(
    declarationTNode: TNode, declarationLView: LView): EmbeddedViewFactoryInternal<T>|null {
  const templateTView = declarationTNode.tViews;
  if (templateTView) {
    if (Array.isArray(templateTView)) {
      // We are currently not supporting inline views.
      throw new Error('Array of TViews not supported');
    }

    return function embeddedViewFactory(context: T) {
      const _isParent = getIsParent();
      const _previousOrParentTNode = getPreviousOrParentTNode();
      const _useIvyAnimationCheck = shouldUseIvyAnimationCheck();
      const _addingEmbeddedRootChild = _useIvyAnimationCheck && getAddingEmbeddedRootChild();
      try {
        setIsParent(true);
        setPreviousOrParentTNode(null !);
        setAddingEmbeddedRootChild(true);

        const lView = createLView(
            declarationLView, templateTView, context, LViewFlags.CheckAlways, null, null);

        ngDevMode && assertEqual(
                         declarationTNode.type, TNodeType.Container,
                         'TNode type should be Container for embedded views');

        const declarationContainer = unwrapLContainer(declarationLView[declarationTNode.index]) !;
        ngDevMode && assertLContainer(declarationContainer);
        const declarationQueries = declarationContainer[QUERIES];
        if (declarationQueries) {
          lView[QUERIES] = declarationQueries.createView();
        }

        assignTViewNodeToLView(templateTView, null, -1, lView);

        if (templateTView.firstTemplatePass) {
          templateTView.node !.injectorIndex = declarationTNode.injectorIndex;
        }

        renderEmbeddedTemplate(lView, templateTView, context);

        return lView;
      } finally {
        _useIvyAnimationCheck && setAddingEmbeddedRootChild(_addingEmbeddedRootChild);
        setIsParent(_isParent);
        setPreviousOrParentTNode(_previousOrParentTNode);
      }
    };
  }
  return null;
}

/**
 * Looks for a container at a given index in an LView, if something other than an `LContainer` is
 * found, we create a new `LContainer` and wrap that item in it, then place that container at the
 * provided index in the `LView`.
 * @param lView The view containing the item to promote or get a container from
 * @param nodeIndex The index of the item to promote or get a container from
 * @param containerNative The RNode to use as the container's native anchor, if we happen to create
 * a container here
 */
export function getOrPromoteLViewChildToLContainer(
    lView: LView, nodeIndex: number, containerNative: RElement | RComment): LContainer {
  ngDevMode && assertRNodeIsInView(lView, containerNative);
  const lViewContainerOrElement = lView[nodeIndex];
  let lContainer = unwrapLContainer(lViewContainerOrElement);
  if (!lContainer) {
    const tHost = lView[TVIEW].data[nodeIndex] as TNode;
    lContainer = lView[nodeIndex] =
        createLContainer(lViewContainerOrElement, lView, containerNative, tHost, true);
    attachLContainerToParentLView(lView, lContainer);
    const queries = lView[QUERIES];
    if (queries) {
      lContainer[QUERIES] = queries.container();
    }
  }
  return lContainer;
}

/**
 * Inserts an `LView` before a given `LView` in an `LContainer`'s `VIEWS`
 *
 * The internal implementation of {@link viewContainerInsertBefore}
 *
 * @param lContainer The container to insert the view into
 * @param lViewToInsert The view to insert into the container
 * @param insertBeforeLView The optional view in the container that the inserted view should be
 * inserted behind. If `null`, it will insert the view at the front of the container as the first
 * child.
 */
export function insertLViewIntoLContainerBefore(
    lContainer: LContainer, lViewToInsert: LView, insertBeforeLView: LView | null) {
  const _addingEmbeddedRootChild = getAddingEmbeddedRootChild();
  try {
    // If the view already exists in the container, we're moving it.
    const existingIndex = getLContainerViewIndex(lContainer, lViewToInsert);
    if (existingIndex >= 0) {
      removeLViewFromLContainer(lContainer, lViewToInsert, false);
    }

    // Set state so that the Animation Renderer knows what we're doing.
    setAddingEmbeddedRootChild(true);

    // Because we're dynamically adding a view to the container, we reset the ACTIVE_INDEX to ensure
    // the container is updated.
    lContainer[ACTIVE_INDEX] = -1;

    // We must get the insertion node *before* we insert the LView into the container's VIEWS,
    // because the current VIEWS, as they stand in the container, are needed to find the appropriate
    // before RNode.
    const beforeNode = getInsertBeforeRNode(lContainer, lViewToInsert, insertBeforeLView);

    // Insert the view into VIEWS (does not add RNodes)
    const index = insertBeforeLView ? getLContainerViewIndex(lContainer, insertBeforeLView) :
                                      getLContainerViewsCount(lContainer);
    insertView(lViewToInsert, lContainer, index);

    ngDevMode && assertEqual(
                     lViewToInsert[TVIEW].firstChild && lViewToInsert[TVIEW].firstChild !.parent,
                     null, 'tNode parent should be null');

    // Add RNodes to DOM.
    addRemoveViewFromContainer(lViewToInsert, true, beforeNode);
  } finally {
    setAddingEmbeddedRootChild(_addingEmbeddedRootChild);
  }
}

/**
 * Finds the appropriate RNode to use in an native insertBefore when inserting a view into a
 * container.
 * @param lContainer The lContainer to insert nodes into
 * @param lViewToInsert The view with the nodes to insert
 * @param insertBeforeLView The view to insert nodes in front of
 */
function getInsertBeforeRNode(
    lContainer: LContainer, lViewToInsert: LView, insertBeforeLView: LView | null) {
  let beforeNode: RNode|null = null;
  const viewCount = getLContainerViewsCount(lContainer);
  const renderer = lViewToInsert[RENDERER];

  if (viewCount > 0) {
    if (insertBeforeLView) {
      // If an insert before view was provided, insert in front of it's first RNode.
      ngDevMode && assertGreaterOrEqual(
                       getLContainerViewIndex(lContainer, insertBeforeLView), 0,
                       'insertBeforeLView must be in LContainer');
      beforeNode = getViewFirstNative(insertBeforeLView);
    } else {
      // No insert before view was provided, so we're inserting at the end of the container.
      const lastView = getLastContainedLView(lContainer);
      if (lastView) {
        // The container isn't empty, and we have a last view, so get RNode *right after* the last
        // RNode from that view.
        beforeNode = nativeNextSibling(renderer, getViewLastNative(lastView));
      }
    }
  } else {
    // There are no other views, so just insert it at the front of the container.
    const containerNative = lContainer[NATIVE];
    beforeNode = nativeNextSibling(renderer, containerNative);
  }
  // If before node is still nell, that's okay, it's an append
  return beforeNode;
}

/**
 * Gets the last view in a container
 * @param lContainer The container to get the last view from
 */
function getLastContainedLView(lContainer: LContainer) {
  return getLViewFromLContainerAt(lContainer, getLContainerViewsCount(lContainer) - 1);
}

/**
 * Finds the first index of a given `LView` in an `LContainer`.
 * @param lContainer the lContainer whose views to search
 * @param lView The view to find in the lContainer
 * @returns The index of the view, or -1 if it's not found.
 */
export function getLContainerViewIndex(lContainer: LContainer, lView: LView) {
  return lContainer[VIEWS].indexOf(lView);
}

/**
 * The internal implementation of {@link viewContainerRemove}
 * @param lContainer The container to remove the view from
 * @param lView The view to remove
 * @param shouldDestroy Whether or not the view should be destroyed in the process.
 */
export function removeLViewFromLContainer(
    lContainer: LContainer, lView: LView, shouldDestroy: boolean): void {
  const index = getLContainerViewIndex(lContainer, lView);
  if (index >= 0) {
    detachView(lContainer, index);
    shouldDestroy && destroyLView(lView);
  }
}

/**
 * Returns the total number of views in the container.
 * @param lContainer the container whose views to count
 */
export function getLContainerViewsCount(lContainer: LContainer): number {
  return lContainer[VIEWS].length;
}

/**
 * Gets an `LView` from an `LContainer` by index.
 * @param lContainer the lContainer to get the view from
 * @param index The index of the view to get from the lContainer
 * @returns The view at the index, or null if the index is out of range or no view is found.
 */
export function getLViewFromLContainerAt(lContainer: LContainer, index: number): LView|null {
  return lContainer[VIEWS][index] || null;
}
