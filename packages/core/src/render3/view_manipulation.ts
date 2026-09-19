/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../primitives/signals';

import {Injector} from '../di/injector';
import {DehydratedContainerView} from '../hydration/interfaces';
import {hasInSkipHydrationBlockFlag} from '../hydration/skip_hydration';
import {assertDefined} from '../util/assert';

import {assertLContainer, assertTNodeForLView} from './assert';
import {renderView} from './instructions/render';
import {TNode} from './interfaces/node';
import {
  DECLARATION_LCONTAINER,
  FLAGS,
  HEADER_OFFSET,
  LView,
  LViewFlags,
  QUERIES,
} from './interfaces/view';
import {createLView, createTView} from './view/construction';

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
    // If a previous attempt to create this embedded view threw partway through, rebuild its
    // TView instead of reusing the corrupted one — mirrors what getOrCreateComponentTView()
    // already does for component TViews.
    let embeddedTView = templateTNode.tView!;
    ngDevMode && assertDefined(embeddedTView, 'TView must be defined for a template node.');
    if (embeddedTView.incompleteFirstPass) {
      const staleTView = embeddedTView;
      embeddedTView = templateTNode.tView = createTView(
        staleTView.type,
        staleTView.declTNode,
        staleTView.template,
        staleTView.bindingStartIndex - HEADER_OFFSET,
        staleTView.expandoStartIndex - staleTView.bindingStartIndex,
        staleTView.directiveRegistry,
        staleTView.pipeRegistry,
        staleTView.viewQuery,
        staleTView.schemas,
        staleTView.consts,
        staleTView.ssrId,
      );
      // Re-inherit the declaration view's queries, which templateCreate() won't wire up again.
      const staleQueries = staleTView.queries;
      if (staleQueries !== null) {
        const inheritedQueryCount =
          staleTView.contentQueries !== null ? staleTView.contentQueries[0] : staleQueries.length;
        embeddedTView.queries = staleQueries.cloneForRebuild(inheritedQueryCount);
      }
    }
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
