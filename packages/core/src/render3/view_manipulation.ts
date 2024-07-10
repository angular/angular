/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {Injector} from '../di/injector';
import {DehydratedContainerView} from '../hydration/interfaces';
import {hasInSkipHydrationBlockFlag} from '../hydration/skip_hydration';
import {assertDefined} from '../util/assert';

import {assertLContainer, assertLView, assertTNodeForLView} from './assert';
import {renderView} from './instructions/render';
import {createLView} from './instructions/shared';
import {CONTAINER_HEADER_OFFSET, LContainer, NATIVE} from './interfaces/container';
import {TNode} from './interfaces/node';
import {RComment, RElement} from './interfaces/renderer_dom';
import {
  DECLARATION_LCONTAINER,
  FLAGS,
  HYDRATION,
  LView,
  LViewFlags,
  QUERIES,
  RENDERER,
  T_HOST,
  TVIEW,
} from './interfaces/view';
import {
  addViewToDOM,
  destroyLView,
  detachView,
  getBeforeNodeForView,
  insertView,
  nativeParentNode,
} from './node_manipulation';

export function createAndRenderEmbeddedLView<T>(
  declarationLView: LView<unknown>,
  templateTNode: TNode,
  context: T,
  options?: {
    injector?: Injector;
    embeddedViewInjector?: Injector;
    dehydratedView?: DehydratedContainerView | null;
  },
): LView<T> {
  const prevConsumer = setActiveConsumer(null);
  try {
    const embeddedTView = templateTNode.tView!;
    ngDevMode && assertDefined(embeddedTView, 'TView must be defined for a template node.');
    ngDevMode && assertTNodeForLView(templateTNode, declarationLView);

    // Embedded views follow the change detection strategy of the view they're declared in.
    const isSignalView = declarationLView[FLAGS] & LViewFlags.SignalView;
    const viewFlags = isSignalView ? LViewFlags.SignalView : LViewFlags.CheckAlways;
    const embeddedLView = createLView<T>(
      declarationLView,
      embeddedTView,
      context,
      viewFlags,
      null,
      templateTNode,
      null,
      null,
      options?.injector ?? null,
      options?.embeddedViewInjector ?? null,
      options?.dehydratedView ?? null,
    );

    const declarationLContainer = declarationLView[templateTNode.index];
    ngDevMode && assertLContainer(declarationLContainer);
    embeddedLView[DECLARATION_LCONTAINER] = declarationLContainer;

    const declarationViewLQueries = declarationLView[QUERIES];
    if (declarationViewLQueries !== null) {
      embeddedLView[QUERIES] = declarationViewLQueries.createEmbeddedView(embeddedTView);
    }

    // execute creation mode of a view
    renderView(embeddedTView, embeddedLView, context);

    return embeddedLView;
  } finally {
    setActiveConsumer(prevConsumer);
  }
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

/**
 * Returns whether an elements that belong to a view should be
 * inserted into the DOM. For client-only cases, DOM elements are
 * always inserted. For hydration cases, we check whether serialized
 * info is available for a view and the view is not in a "skip hydration"
 * block (in which case view contents was re-created, thus needing insertion).
 */
export function shouldAddViewToDom(
  tNode: TNode,
  dehydratedView?: DehydratedContainerView | null,
): boolean {
  return (
    !dehydratedView || dehydratedView.firstChild === null || hasInSkipHydrationBlockFlag(tNode)
  );
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
    const parentRNode = nativeParentNode(renderer, lContainer[NATIVE] as RElement | RComment);
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
