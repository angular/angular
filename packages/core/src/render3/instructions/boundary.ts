/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../../primitives/signals';
import {HEADER_OFFSET, LView, ON_ERROR, TVIEW, CONTEXT} from '../interfaces/view';
import {performanceMarkFeature} from '../../util/performance';
import {getLView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {bindingUpdated} from '../bindings';
import {createAndRenderEmbeddedLView, shouldAddViewToDom} from '../view_manipulation';
import {
  addLViewToLContainer,
  removeLViewFromLContainer,
  getLViewFromLContainer,
} from '../view/container';
import {destroyLView} from '../node_manipulation';
import {markViewForRefresh} from '../util/view_utils';
import {getLContainer, getExistingTNode} from './control_flow';
import {LContainer} from '../interfaces/container';
import {findAndReconcileMatchingDehydratedViews} from '../../hydration/views';

/**
 * Error thrown when an error falls through an @boundary without matching any @error block.
 */
export class BoundaryError extends Error {
  constructor(message: string, options?: {cause?: unknown}) {
    super(message, options);
    this.name = 'BoundaryError';
  }
}

/**
 * State object representing an @boundary block, allocated in the LView data array.
 */
export class LBoundary {
  error: any = null;

  constructor(private hostLView: LView) {}

  reset() {
    this.error = null;
    markViewForRefresh(this.hostLView);
  }
}

// BoundaryErrorContext was removed and replaced by a plain object at runtime.
/**
 * Creates an LBoundary state object in the current LView.
 */
export function ɵɵboundaryCreate(index: number) {
  performanceMarkFeature('NgControlFlow');
  const lView = getLView();
  lView[HEADER_OFFSET + index] = new LBoundary(lView);
}

/**
 * Retrieves the LBoundary state object from the current LView.
 */
export function ɵɵgetBoundary(index: number): LBoundary {
  const lView = getLView();
  return lView[HEADER_OFFSET + index] as LBoundary;
}

/**
 * The boundary update instruction performs conditional view switching and attaches
 * an ON_ERROR interceptor if it is rendering the primary block.
 */
export function ɵɵboundaryUpdate(
  slotIndex: number,
  matchingTemplateIndex: number,
  primaryTemplateIndex: number,
  contextValue?: any,
) {
  performanceMarkFeature('NgControlFlow');

  const hostLView = getLView();
  const bindingIndex = nextBindingIndex();
  const prevMatchingTemplateIndex: number =
    hostLView[bindingIndex] !== NO_CHANGE ? hostLView[bindingIndex] : -1;
  const prevContainer =
    prevMatchingTemplateIndex !== -1
      ? getLContainer(hostLView, HEADER_OFFSET + prevMatchingTemplateIndex)
      : undefined;
  const viewInContainerIdx = 0;

  if (bindingUpdated(hostLView, bindingIndex, matchingTemplateIndex)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      if (prevContainer !== undefined) {
        removeLViewFromLContainer(prevContainer, viewInContainerIdx);
      }

      if (matchingTemplateIndex !== -1) {
        const nextLContainerIndex = HEADER_OFFSET + matchingTemplateIndex;
        const nextContainer = getLContainer(hostLView, nextLContainerIndex);
        const templateTNode = getExistingTNode(hostLView[TVIEW], nextLContainerIndex);

        const dehydratedView = findAndReconcileMatchingDehydratedViews(
          nextContainer,
          templateTNode,
          hostLView,
        );

        let embeddedLView: LView<any> | undefined;
        try {
          const boundary = hostLView[HEADER_OFFSET + slotIndex] as LBoundary;
          const context =
            matchingTemplateIndex === primaryTemplateIndex
              ? contextValue
              : {$error: boundary.error, $retry: () => boundary.reset()};
          embeddedLView = createAndRenderEmbeddedLView(hostLView, templateTNode, context, {
            dehydratedView,
          });

          if (matchingTemplateIndex === primaryTemplateIndex) {
            embeddedLView[ON_ERROR] = (error: Error, details: any) => {
              const boundary = hostLView[HEADER_OFFSET + slotIndex] as LBoundary;
              boundary.error = error;

              // Immediately destroy the primary view
              removeLViewFromLContainer(nextContainer, viewInContainerIdx);
              destroyLView(embeddedLView![TVIEW], embeddedLView!);

              // Trigger a targeted change detection pass on the host to run the @error block
              markViewForRefresh(hostLView);
            };
          }
        } catch (e) {
          if (matchingTemplateIndex === primaryTemplateIndex) {
            const boundary = hostLView[HEADER_OFFSET + slotIndex] as LBoundary;
            boundary.error = e;
            markViewForRefresh(hostLView);

            // If the view threw during creation, we do not add it to the DOM.
            // We swallow the error so that the host can finish its current change detection cycle
            // and later re-evaluate the boundary switch statement to render the @error block.
            return;
          }
          // If we caught an error inside an @error block, rethrow it to let it bubble naturally.
          throw e;
        }

        addLViewToLContainer(
          nextContainer,
          embeddedLView,
          viewInContainerIdx,
          shouldAddViewToDom(templateTNode, dehydratedView),
        );
      } else {
        const boundary = hostLView[HEADER_OFFSET + slotIndex] as LBoundary;
        if (boundary.error !== null) {
          throw new BoundaryError('Unhandled error in @boundary fell through.', {
            cause: boundary.error,
          });
        }
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  } else if (prevContainer !== undefined) {
    const lView = getLViewFromLContainer<any>(prevContainer, viewInContainerIdx);
    if (lView !== undefined) {
      lView[CONTEXT] = contextValue;
      markViewForRefresh(lView);
    }
  }
}
