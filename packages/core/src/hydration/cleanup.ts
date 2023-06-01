/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef} from '../application_ref';
import {CONTAINER_HEADER_OFFSET, DEHYDRATED_VIEWS, LContainer} from '../render3/interfaces/container';
import {Renderer} from '../render3/interfaces/renderer';
import {RNode} from '../render3/interfaces/renderer_dom';
import {isLContainer} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, HOST, LView, PARENT, RENDERER, TVIEW} from '../render3/interfaces/view';
import {nativeRemoveNode} from '../render3/node_manipulation';
import {EMPTY_ARRAY} from '../util/empty';

import {validateSiblingNodeExists} from './error_handling';
import {DehydratedContainerView, NUM_ROOT_NODES} from './interfaces';
import {getComponentLViewForHydration} from './utils';

/**
 * Removes all dehydrated views from a given LContainer:
 * both in internal data structure, as well as removing
 * corresponding DOM nodes that belong to that dehydrated view.
 */
export function removeDehydratedViews(lContainer: LContainer) {
  const views = lContainer[DEHYDRATED_VIEWS] ?? [];
  const parentLView = lContainer[PARENT];
  const renderer = parentLView[RENDERER];
  for (const view of views) {
    removeDehydratedView(view, renderer);
    ngDevMode && ngDevMode.dehydratedViewsRemoved++;
  }
  // Reset the value to an empty array to indicate that no
  // further processing of dehydrated views is needed for
  // this view container (i.e. do not trigger the lookup process
  // once again in case a `ViewContainerRef` is created later).
  lContainer[DEHYDRATED_VIEWS] = EMPTY_ARRAY;
}

/**
 * Helper function to remove all nodes from a dehydrated view.
 */
function removeDehydratedView(dehydratedView: DehydratedContainerView, renderer: Renderer) {
  let nodesRemoved = 0;
  let currentRNode = dehydratedView.firstChild;
  if (currentRNode) {
    const numNodes = dehydratedView.data[NUM_ROOT_NODES];
    while (nodesRemoved < numNodes) {
      ngDevMode && validateSiblingNodeExists(currentRNode);
      const nextSibling: RNode = currentRNode.nextSibling!;
      nativeRemoveNode(renderer, currentRNode, false);
      currentRNode = nextSibling;
      nodesRemoved++;
    }
  }
}

/**
 * Walks over all views within this LContainer invokes dehydrated views
 * cleanup function for each one.
 */
function cleanupLContainer(lContainer: LContainer) {
  removeDehydratedViews(lContainer);
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    cleanupLView(lContainer[i] as LView);
  }
}

/**
 * Walks over `LContainer`s and components registered within
 * this LView and invokes dehydrated views cleanup function for each one.
 */
function cleanupLView(lView: LView) {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (isLContainer(lView[i])) {
      const lContainer = lView[i];
      cleanupLContainer(lContainer);
    } else if (Array.isArray(lView[i])) {
      // This is a component, enter the `cleanupLView` recursively.
      cleanupLView(lView[i]);
    }
  }
}

/**
 * Walks over all views registered within the ApplicationRef and removes
 * all dehydrated views from all `LContainer`s along the way.
 */
export function cleanupDehydratedViews(appRef: ApplicationRef) {
  const viewRefs = appRef._views;
  for (const viewRef of viewRefs) {
    const lView = getComponentLViewForHydration(viewRef);
    // An `lView` might be `null` if a `ViewRef` represents
    // an embedded view (not a component view).
    if (lView !== null && lView[HOST] !== null) {
      cleanupLView(lView);
      ngDevMode && ngDevMode.dehydratedViewsCleanupRuns++;
    }
  }
}
