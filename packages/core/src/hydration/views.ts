/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DEHYDRATED_VIEWS, LContainer} from '../render3/interfaces/container';
import {TNode, TNodeFlags} from '../render3/interfaces/node';
import {RNode} from '../render3/interfaces/renderer_dom';
import {isLContainer} from '../render3/interfaces/type_checks';
import {LView, TVIEW} from '../render3/interfaces/view';

import {removeDehydratedViews} from './cleanup';
import {
  DehydratedContainerView,
  MULTIPLIER,
  NUM_ROOT_NODES,
  SerializedContainerView,
  TEMPLATE_ID,
} from './interfaces';
import {siblingAfter} from './node_lookup_utils';

/**
 * Given a current DOM node and a serialized information about the views
 * in a container, walks over the DOM structure, collecting the list of
 * dehydrated views.
 */
export function locateDehydratedViewsInContainer(
  currentRNode: RNode,
  serializedViews: SerializedContainerView[],
): [RNode, DehydratedContainerView[]] {
  const dehydratedViews: DehydratedContainerView[] = [];
  for (const serializedView of serializedViews) {
    // Repeats a view multiple times as needed, based on the serialized information
    // (for example, for *ngFor-produced views).
    for (let i = 0; i < (serializedView[MULTIPLIER] ?? 1); i++) {
      const view: DehydratedContainerView = {
        data: serializedView,
        firstChild: null,
      };
      if (serializedView[NUM_ROOT_NODES] > 0) {
        // Keep reference to the first node in this view,
        // so it can be accessed while invoking template instructions.
        view.firstChild = currentRNode as HTMLElement;

        // Move over to the next node after this view, which can
        // either be a first node of the next view or an anchor comment
        // node after the last view in a container.
        currentRNode = siblingAfter(serializedView[NUM_ROOT_NODES], currentRNode)!;
      }
      dehydratedViews.push(view);
    }
  }

  return [currentRNode, dehydratedViews];
}

/**
 * Reference to a function that searches for a matching dehydrated views
 * stored on a given lContainer.
 * Returns `null` by default, when hydration is not enabled.
 */
let _findMatchingDehydratedViewImpl: typeof findMatchingDehydratedViewImpl = () => null;

/**
 * Reference to a function that searches for a matching dehydrated view
 * stored on a control flow lContainer and removes the dehydrated content
 * once found.
 * Returns `null` by default, when hydration is not enabled.
 */
let _findAndReconcileMatchingDehydratedViewsImpl: typeof findAndReconcileMatchingDehydratedViewsImpl =
  () => null;

export function enableFindMatchingDehydratedViewImpl() {
  _findMatchingDehydratedViewImpl = findMatchingDehydratedViewImpl;
  _findAndReconcileMatchingDehydratedViewsImpl = findAndReconcileMatchingDehydratedViewsImpl;
}

/**
 * Retrieves the next dehydrated view from the LContainer and verifies that
 * it matches a given template id (from the TView that was used to create this
 * instance of a view). If the id doesn't match, that means that we are in an
 * unexpected state and can not complete the reconciliation process. Thus,
 * all dehydrated views from this LContainer are removed (including corresponding
 * DOM nodes) and the rendering is performed as if there were no dehydrated views
 * in this container.
 */
function findMatchingDehydratedViewImpl(
  lContainer: LContainer,
  template: string | null,
): DehydratedContainerView | null {
  if (hasMatchingDehydratedView(lContainer, template)) {
    return lContainer[DEHYDRATED_VIEWS]!.shift()!;
  } else {
    // Otherwise, we are at the state when reconciliation can not be completed,
    // thus we remove all dehydrated views within this container (remove them
    // from internal data structures as well as delete associated elements from
    // the DOM tree).
    removeDehydratedViews(lContainer);
    return null;
  }
}

export function findMatchingDehydratedView(
  lContainer: LContainer,
  template: string | null,
): DehydratedContainerView | null {
  return _findMatchingDehydratedViewImpl(lContainer, template);
}

export function findAndReconcileMatchingDehydratedViewsImpl(
  lContainer: LContainer,
  templateTNode: TNode,
  hostLView: LView,
): DehydratedContainerView | null {
  if (templateTNode.tView!.ssrId === null) return null;
  const dehydratedView = findMatchingDehydratedView(lContainer, templateTNode.tView!.ssrId);

  // we know that an ssrId was generated, but we were unable to match it to
  // a dehydrated view, which means that we may have changed branches
  // between server and client. We'll need to find and remove those
  // stale dehydrated views.
  if (hostLView[TVIEW].firstUpdatePass && dehydratedView === null) {
    removeStaleDehydratedBranch(hostLView, templateTNode);
  }
  return dehydratedView;
}

export function findAndReconcileMatchingDehydratedViews(
  lContainer: LContainer,
  templateTNode: TNode,
  hostLView: LView,
): DehydratedContainerView | null {
  return _findAndReconcileMatchingDehydratedViewsImpl(lContainer, templateTNode, hostLView);
}

/**
 * In the case that we have control flow that changes branches between server and
 * client, we're left with dehydrated content that will not be used. We need to find
 * it and clean it up at the right time so that we don't see duplicate content for
 * a few moments before the application reaches stability. This navigates the
 * control flow containers by looking at the TNodeFlags to find the matching
 * dehydrated content for the branch that is now stale from the server and removes it.
 */
function removeStaleDehydratedBranch(hostLView: LView, tNode: TNode): void {
  let currentTNode: TNode | null = tNode;
  while (currentTNode) {
    // We can return here if we've found the dehydrated view and cleaned it up.
    // Otherwise we continue on until we either find it or reach the start of
    // the control flow.
    if (cleanupMatchingDehydratedViews(hostLView, currentTNode)) return;

    if ((currentTNode.flags & TNodeFlags.isControlFlowStart) === TNodeFlags.isControlFlowStart) {
      // we've hit the top of the control flow loop
      break;
    }

    currentTNode = currentTNode.prev;
  }

  currentTNode = tNode.next; // jump to place we started so we can navigate down from there

  while (currentTNode) {
    if ((currentTNode.flags & TNodeFlags.isInControlFlow) !== TNodeFlags.isInControlFlow) {
      // we've exited control flow and need to exit the loop.
      break;
    }

    // Similar to above, we can return here if we've found the dehydrated view
    // and cleaned it up. Otherwise we continue on until we either find it or
    // reach the end of the control flow.
    if (cleanupMatchingDehydratedViews(hostLView, currentTNode)) return;

    currentTNode = currentTNode.next;
  }
}

function hasMatchingDehydratedView(lContainer: LContainer, template: string | null): boolean {
  const views = lContainer[DEHYDRATED_VIEWS];
  if (!template || views === null || views.length === 0) {
    return false;
  }
  // Verify whether the first dehydrated view in the container matches
  // the template id passed to this function (that originated from a TView
  // that was used to create an instance of an embedded or component views.
  return views[0].data[TEMPLATE_ID] === template;
}

function cleanupMatchingDehydratedViews(hostLView: LView, currentTNode: TNode): boolean {
  const ssrId = currentTNode.tView?.ssrId;
  if (ssrId == null /* check both `null` and `undefined` */) return false;

  const container = hostLView[currentTNode.index];
  // if we can find the dehydrated view in this container, we know we've found the stale view
  // and we can remove it.
  if (isLContainer(container) && hasMatchingDehydratedView(container, ssrId)) {
    removeDehydratedViews(container);
    return true;
  }
  return false;
}
