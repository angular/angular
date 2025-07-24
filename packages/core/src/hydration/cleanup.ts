/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '../application/application_ref';
import {DehydratedDeferBlock} from '../defer/interfaces';
import {DehydratedBlockRegistry} from '../defer/registry';
import {
  CONTAINER_HEADER_OFFSET,
  DEHYDRATED_VIEWS,
  LContainer,
} from '../render3/interfaces/container';
import {Renderer} from '../render3/interfaces/renderer';
import {RNode} from '../render3/interfaces/renderer_dom';
import {isLContainer, isLView} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, HOST, LView, PARENT, RENDERER, TVIEW} from '../render3/interfaces/view';
import {nativeRemoveNode} from '../render3/dom_node_manipulation';

import {validateSiblingNodeExists} from './error_handling';
import {cleanupI18nHydrationData} from './i18n';
import {DEFER_BLOCK_ID, DehydratedContainerView, NUM_ROOT_NODES} from './interfaces';
import {getLNodeForHydration} from './utils';

/**
 * Removes all dehydrated views from a given LContainer:
 * both in internal data structure, as well as removing
 * corresponding DOM nodes that belong to that dehydrated view.
 */
export function removeDehydratedViews(lContainer: LContainer) {
  const views = lContainer[DEHYDRATED_VIEWS] ?? [];
  const parentLView = lContainer[PARENT];
  const renderer = parentLView[RENDERER];
  const retainedViews = [];
  for (const view of views) {
    // Do not clean up contents of `@defer` blocks.
    // The cleanup for this content would happen once a given block
    // is triggered and hydrated.
    if (view.data[DEFER_BLOCK_ID] !== undefined) {
      retainedViews.push(view);
    } else {
      removeDehydratedView(view, renderer);
      ngDevMode && ngDevMode.dehydratedViewsRemoved++;
    }
  }
  // Reset the value to an array to indicate that no
  // further processing of dehydrated views is needed for
  // this view container (i.e. do not trigger the lookup process
  // once again in case a `ViewContainerRef` is created later).
  lContainer[DEHYDRATED_VIEWS] = retainedViews;
}

export function removeDehydratedViewList(deferBlock: DehydratedDeferBlock) {
  const {lContainer} = deferBlock;
  const dehydratedViews = lContainer[DEHYDRATED_VIEWS];
  if (dehydratedViews === null) return;
  const parentLView = lContainer[PARENT];
  const renderer = parentLView[RENDERER];
  for (const view of dehydratedViews) {
    removeDehydratedView(view, renderer);
    ngDevMode && ngDevMode.dehydratedViewsRemoved++;
  }
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
export function cleanupLContainer(lContainer: LContainer) {
  removeDehydratedViews(lContainer);

  // The host could be an LView if this container is on a component node.
  // In this case, descend into host LView for further cleanup. See also
  // LContainer[HOST] docs for additional information.
  const hostLView = lContainer[HOST];
  if (isLView(hostLView)) {
    cleanupLView(hostLView);
  }

  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    cleanupLView(lContainer[i] as LView);
  }
}

/**
 * Walks over `LContainer`s and components registered within
 * this LView and invokes dehydrated views cleanup function for each one.
 */
function cleanupLView(lView: LView) {
  cleanupI18nHydrationData(lView);

  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (isLContainer(lView[i])) {
      const lContainer = lView[i];
      cleanupLContainer(lContainer);
    } else if (isLView(lView[i])) {
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
    const lNode = getLNodeForHydration(viewRef);
    // An `lView` might be `null` if a `ViewRef` represents
    // an embedded view (not a component view).
    if (lNode !== null && lNode[HOST] !== null) {
      if (isLView(lNode)) {
        cleanupLView(lNode);
      } else {
        // Cleanup in all views within this view container
        cleanupLContainer(lNode);
      }
      ngDevMode && ngDevMode.dehydratedViewsCleanupRuns++;
    }
  }
}

/**
 * post hydration cleanup handling for defer blocks that were incrementally
 * hydrated. This removes all the jsaction attributes, timers, observers,
 * dehydrated views and containers
 */
export function cleanupHydratedDeferBlocks(
  deferBlock: DehydratedDeferBlock | null,
  hydratedBlocks: string[],
  registry: DehydratedBlockRegistry,
  appRef: ApplicationRef,
): void {
  if (deferBlock !== null) {
    registry.cleanup(hydratedBlocks);
    cleanupLContainer(deferBlock.lContainer);
    cleanupDehydratedViews(appRef);
  }
}
