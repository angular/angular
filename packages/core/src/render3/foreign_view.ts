/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createLView, createTView} from './view/construction';
import {createTNode} from './tnode_manipulation';
import {
  FLAGS,
  HEADER_OFFSET,
  LView,
  LViewFlags,
  PARENT,
  RENDERER,
  TViewType,
  T_HOST,
  TVIEW,
} from './interfaces/view';
import {TNodeType} from './interfaces/node';
import {LContainer} from './interfaces/container';
import {addLViewToLContainer} from './view/container';
import {ViewRef} from './view_ref';

export class ForeignViewRef<T> extends ViewRef<T> {
  get head(): any {
    const lView = this._lView;
    const tView = lView[TVIEW];
    return lView[tView.firstChild!.index];
  }

  get tail(): any {
    const lView = this._lView;
    const tView = lView[TVIEW];
    return lView[tView.firstChild!.next!.index];
  }
}

/**
 * Creates and inserts a foreign view context programmatically into a container.
 * A foreign view is bounded by `head` and `tail` comment nodes and can hold dynamic nodes.
 *
 * @param lContainer The target container where the view will be inserted.
 * @param index The index at which to insert the view.
 */
export function createForeignView(lContainer: LContainer, index: number): ForeignViewRef<unknown> {
  const declLView = lContainer[PARENT] as LView;
  const declTNode = lContainer[T_HOST];
  const renderer = declLView[RENDERER];

  // 1. Create TView with 3 slots (head, tail, fragment)
  const tView = createTView(
    TViewType.Foreign,
    declTNode, // link to container host
    null, // templateFn (safe! Checked by renderView)
    3, // decls
    0, // vars
    null,
    null,
    null,
    null,
    null,
    null,
  );

  // 2. Create TNodes for head and tail to make them addressable
  const headTNode = (tView.data[HEADER_OFFSET] = createTNode(
    tView,
    null,
    TNodeType.Element,
    HEADER_OFFSET,
    '',
    null,
  ));
  const tailTNode = (tView.data[HEADER_OFFSET + 1] = createTNode(
    tView,
    null,
    TNodeType.Element,
    HEADER_OFFSET + 1,
    '',
    null,
  ));

  // 3. Link them in the view
  tView.firstChild = headTNode;
  headTNode.next = tailTNode;
  tailTNode.prev = headTNode;

  // 4. Create LView
  const lView = createLView(
    declLView,
    tView,
    null,
    0 as LViewFlags, // Do not set CheckAlways for foreign views
    null,
    null,
    null,
    renderer, // pass it through
    null,
    null,
    null,
  );

  // 5. "Render" the view by creating the head and tail nodes, populating their slots, and marking
  // the view as created. This last step is normally handled by `renderView()` for native Angular
  // views with template functions.
  const headComment = (lView[headTNode.index] = renderer.createComment(
    ngDevMode ? 'foreign-view-head' : '',
  ));
  const tailComment = (lView[tailTNode.index] = renderer.createComment(
    ngDevMode ? 'foreign-view-tail' : '',
  ));
  lView[FLAGS] &= ~LViewFlags.CreationMode;

  // 6. Insert the view into the container
  const viewRef = new ForeignViewRef(lView);
  addLViewToLContainer(lContainer, lView, index);

  // If the head node has no parent, this means we've inserted it into a view container at the root
  // of a view that is currently detached from the DOM. In this case, we need to eagerly create a
  // fragment to hold the head and tail nodes to ensure that any foreign content inserted into this
  // view is retained until attached to the DOM.
  if (!headComment.parentNode) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(headComment as unknown as Comment);
    fragment.appendChild(tailComment as unknown as Comment);
    const fragmentSlotIndex = tailTNode.index + 1;
    lView[fragmentSlotIndex] = fragment;
  }

  return viewRef;
}
