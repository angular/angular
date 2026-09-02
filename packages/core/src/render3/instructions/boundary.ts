/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../../primitives/signals';
import {Type} from '../../core';
import {ErrorDetails, ErrorHandler, encapsulateBoundaryError} from '../../error_handler';
import {findAndReconcileMatchingDehydratedViews} from '../../hydration/views';
import {performanceMarkFeature} from '../../util/performance';
import {bindingUpdated} from '../bindings';
import {
  CONTEXT,
  DECLARATION_COMPONENT_VIEW,
  HEADER_OFFSET,
  INJECTOR,
  LView,
  ON_ERROR,
  TVIEW,
} from '../interfaces/view';
import {getLView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {markViewForRefresh} from '../util/view_utils';
import {
  addLViewToLContainer,
  getLViewFromLContainer,
  removeLViewFromLContainer,
} from '../view/container';
import {createAndRenderEmbeddedLView, shouldAddViewToDom} from '../view_manipulation';
import {getExistingTNode, getLContainer} from './control_flow';

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

/**
 * Creates an LBoundary state object in the current LView.
 */
export function ɵɵboundaryCreate(index: number) {
  performanceMarkFeature('NgBoundary');
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
 *
 * TODO: This instruction shares a lot of view switching logic with `ɵɵconditional`.
 * We should investigate extracting the common container management and view reconciliation
 * logic into a shared utility function to reduce duplication.
 */
export function ɵɵboundaryUpdate(
  slotIndex: number,
  matchingTemplateIndex: number,
  primaryTemplateIndex: number,
) {
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
              ? undefined
              : {$error: boundary.error, $retry: () => boundary.reset()};
          embeddedLView = createAndRenderEmbeddedLView(hostLView, templateTNode, context, {
            dehydratedView,
          });

          if (matchingTemplateIndex === primaryTemplateIndex) {
            embeddedLView[ON_ERROR] = (error: Error, details: any) => {
              const boundary = hostLView[HEADER_OFFSET + slotIndex] as LBoundary;
              boundary.error = error;

              const errorHandler = hostLView[INJECTOR]?.get(ErrorHandler, null);
              if (errorHandler) {
                const boundaryComponentView = hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT] as any;
                const boundaryType: Type<unknown> = boundaryComponentView.constructor;
                details.boundary = {
                  type: boundaryType,
                  reset: () => boundary.reset(),
                };

                if (errorHandler.onViewError) {
                  errorHandler.onViewError(error, details);
                } else {
                  errorHandler.handleError(error);
                }
              }

              // Immediately destroy the primary view
              removeLViewFromLContainer(nextContainer, viewInContainerIdx);

              // Trigger a targeted change detection pass on the host to run the @error block
              markViewForRefresh(hostLView);
            };
          }
        } catch (e) {
          if (matchingTemplateIndex === primaryTemplateIndex) {
            const boundary = hostLView[HEADER_OFFSET + slotIndex] as LBoundary;
            boundary.error = e;

            const errorHandler = hostLView[INJECTOR]?.get(ErrorHandler, null);
            if (errorHandler) {
              const boundaryError = encapsulateBoundaryError(e);
              const declarationInstance = hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT];
              const declarationType = (declarationInstance as any).constructor;
              const details: ErrorDetails = {
                declarationInstance,
                declarationType,
                boundary: {
                  type: declarationType,
                  reset: () => boundary.reset(),
                },
              };
              if (errorHandler.onViewError) {
                errorHandler.onViewError(boundaryError, details);
              } else {
                errorHandler.handleError(boundaryError);
              }
            }

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
  }
}
