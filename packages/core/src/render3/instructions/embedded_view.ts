/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual} from '../../util/assert';
import {assertLContainerOrUndefined} from '../assert';
import {ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {RenderFlags} from '../interfaces/definition';
import {TContainerNode, TNodeType} from '../interfaces/node';
import {FLAGS, LView, LViewFlags, PARENT, QUERIES, TVIEW, TView, T_HOST} from '../interfaces/view';
import {assertNodeType} from '../node_assert';
import {insertView, removeView} from '../node_manipulation';
import {enterView, getIsParent, getLView, getPreviousOrParentTNode, isCreationMode, leaveView, setIsParent, setPreviousOrParentTNode} from '../state';
import {resetPreOrderHookFlags} from '../util/view_utils';
import {assignTViewNodeToLView, createLView, createTView, refreshDescendantViews} from './shared';

/**
 * Marks the start of an embedded view.
 *
 * @param viewBlockId The ID of this view
 * @return boolean Whether or not this view is in creation mode
 *
 * @codeGenApi
 */
export function ɵɵembeddedViewStart(
    viewBlockId: number, consts: number, vars: number): RenderFlags {
  const lView = getLView();
  const previousOrParentTNode = getPreviousOrParentTNode();
  // The previous node can be a view node if we are processing an inline for loop
  const containerTNode = previousOrParentTNode.type === TNodeType.View ?
      previousOrParentTNode.parent ! :
      previousOrParentTNode;
  const lContainer = lView[containerTNode.index] as LContainer;

  ngDevMode && assertNodeType(containerTNode, TNodeType.Container);
  let viewToRender = scanForView(lContainer, lContainer[ACTIVE_INDEX] !, viewBlockId);

  if (viewToRender) {
    setIsParent();
    enterView(viewToRender, viewToRender[TVIEW].node);
  } else {
    // When we create a new LView, we always reset the state of the instructions.
    viewToRender = createLView(
        lView,
        getOrCreateEmbeddedTView(viewBlockId, consts, vars, containerTNode as TContainerNode), null,
        LViewFlags.CheckAlways, null, null);

    const tParentNode = getIsParent() ? previousOrParentTNode :
                                        previousOrParentTNode && previousOrParentTNode.parent;
    assignTViewNodeToLView(viewToRender[TVIEW], tParentNode, viewBlockId, viewToRender);
    enterView(viewToRender, viewToRender[TVIEW].node);
  }
  if (lContainer) {
    if (isCreationMode(viewToRender)) {
      // it is a new view, insert it into collection of views for a given container
      insertView(viewToRender, lContainer, lContainer[ACTIVE_INDEX] !);
    }
    lContainer[ACTIVE_INDEX] !++;
  }
  return isCreationMode(viewToRender) ? RenderFlags.Create | RenderFlags.Update :
                                        RenderFlags.Update;
}

/**
 * Initialize the TView (e.g. static data) for the active embedded view.
 *
 * Each embedded view block must create or retrieve its own TView. Otherwise, the embedded view's
 * static data for a particular node would overwrite the static data for a node in the view above
 * it with the same index (since it's in the same template).
 *
 * @param viewIndex The index of the TView in TNode.tViews
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param vars The number of bindings and pure function bindings in this template
 * @param container The parent container in which to look for the view's static data
 * @returns TView
 */
function getOrCreateEmbeddedTView(
    viewIndex: number, consts: number, vars: number, parent: TContainerNode): TView {
  const tView = getLView()[TVIEW];
  ngDevMode && assertNodeType(parent, TNodeType.Container);
  const containerTViews = parent.tViews as TView[];
  ngDevMode && assertDefined(containerTViews, 'TView expected');
  ngDevMode && assertEqual(Array.isArray(containerTViews), true, 'TViews should be in an array');
  if (viewIndex >= containerTViews.length || containerTViews[viewIndex] == null) {
    containerTViews[viewIndex] = createTView(
        viewIndex, null, consts, vars, tView.directiveRegistry, tView.pipeRegistry, null, null);
  }
  return containerTViews[viewIndex];
}


/**
 * Looks for a view with a given view block id inside a provided LContainer.
 * Removes views that need to be deleted in the process.
 *
 * @param lContainer to search for views
 * @param startIdx starting index in the views array to search from
 * @param viewBlockId exact view block id to look for
 */
function scanForView(lContainer: LContainer, startIdx: number, viewBlockId: number): LView|null {
  for (let i = startIdx + CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const viewAtPositionId = lContainer[i][TVIEW].id;
    if (viewAtPositionId === viewBlockId) {
      return lContainer[i];
    } else if (viewAtPositionId < viewBlockId) {
      // found a view that should not be at this position - remove
      removeView(lContainer, i - CONTAINER_HEADER_OFFSET);
    } else {
      // found a view with id greater than the one we are searching for
      // which means that required view doesn't exist and can't be found at
      // later positions in the views array - stop the searchdef.cont here
      break;
    }
  }
  return null;
}

/**
 * Marks the end of an embedded view.
 *
 * @codeGenApi
 */
export function ɵɵembeddedViewEnd(): void {
  const lView = getLView();
  const viewHost = lView[T_HOST];

  if (isCreationMode(lView)) {
    refreshDescendantViews(lView);  // creation mode pass
    lView[FLAGS] &= ~LViewFlags.CreationMode;
  }
  resetPreOrderHookFlags(lView);
  refreshDescendantViews(lView);  // update mode pass
  const lContainer = lView[PARENT] as LContainer;
  ngDevMode && assertLContainerOrUndefined(lContainer);
  // It's always safe to run hooks here, as `leaveView` is not called during the 'finally' block
  // of a try-catch-finally statement, so it can never be reached while unwinding the stack due to
  // an error being thrown.
  leaveView(lContainer[PARENT] !, /* safeToRunHooks */ true);
  setPreviousOrParentTNode(viewHost !, false);
}
