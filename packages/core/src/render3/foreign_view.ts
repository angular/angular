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
import {isLContainer} from './interfaces/type_checks';
import {ViewContainerRef} from '../linker/view_container_ref';
import {ViewRef} from './view_ref';

export class ɵForeignViewRef<T> extends ViewRef<T> {
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
 * @param container The target container (LContainer or ViewContainerRef) where the view will be inserted.
 * @param index The index at which to insert the view.
 */
export function ɵcreateAndInsertForeignView(
  container: LContainer | ViewContainerRef,
  index: number,
): ɵForeignViewRef<unknown> {
  const lContainer = isLContainer(container)
    ? container
    : ((container as any)['_lContainer'] as LContainer);
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

  // 2. Create comment nodes themselves using parent's renderer
  const headComment = renderer.createComment('');
  const tailComment = renderer.createComment('');

  // 3. Create TNodes for head and tail to make them addressable
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

  // 4. Link them in the view
  tView.firstChild = headTNode;
  headTNode.next = tailTNode;
  tailTNode.prev = headTNode;

  // 5. Create LView
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

  lView[FLAGS] &= ~LViewFlags.CreationMode;

  // 6. Populate slots with the created comment nodes
  lView[headTNode.index] = headComment;
  lView[tailTNode.index] = tailComment;

  // 7. Insert the view into the container
  const viewRef = new ɵForeignViewRef(lView);
  if (isLContainer(container)) {
    addLViewToLContainer(container, lView, index);
  } else {
    // When using ViewContainerRef, go through standard public insert() to register in VIEW_REFS cache!
    container.insert(viewRef, index);
  }

  if (!headComment.parentNode) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(headComment as unknown as Comment);
    fragment.appendChild(tailComment as unknown as Comment);
    const fragmentSlotIndex = tailTNode.index + 1;
    lView[fragmentSlotIndex] = fragment;
  }

  return viewRef;
}
