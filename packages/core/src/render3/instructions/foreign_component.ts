/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ForeignComponent, RENDER} from '../../interface/foreign_component';
import {attachPatchData} from '../context_discovery';
import {createForeignView} from '../foreign_view';
import {TContainerNode, TNodeType} from '../interfaces/node';
import {HEADER_OFFSET, RENDERER} from '../interfaces/view';
import {appendChild} from '../node_manipulation';
import {getLView, getTView} from '../state';
import {getOrCreateTNode} from '../tnode_manipulation';
import {addToEndOfViewTree} from '../view/construction';
import {createLContainer} from '../view/container';

/**
 * Creation phase instruction to render a foreign component.
 *
 * @template TProps The properties of the foreign component.
 * @param index The index of the container in the data array.
 * @param foreignComponent The matched foreign component.
 * @param props Aggregate properties and static attributes.
 * @codeGenApi
 */
export function ɵɵforeignComponent<TProps>(
  index: number,
  foreignComponent: ForeignComponent<TProps>,
  props: TProps,
): void {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;

  // 1. Get or create TNode for this container slot
  let tNode: TContainerNode;
  if (tView.firstCreatePass) {
    tNode = getOrCreateTNode(tView, adjustedIndex, TNodeType.Container, null, null);
  } else {
    tNode = tView.data[adjustedIndex] as TContainerNode;
  }

  // 2. Create the anchor node in the DOM
  const renderer = lView[RENDERER];
  const comment = renderer.createComment(ngDevMode ? 'foreign-component' : '');
  appendChild(tView, lView, comment, tNode);
  attachPatchData(comment, lView);

  // 3. Create the hosting LContainer
  const lContainer = createLContainer(comment, lView, comment, tNode);
  lView[adjustedIndex] = lContainer;
  addToEndOfViewTree(lView, lContainer);

  // 4. Create the Foreign View and insert it at index 0 of the container
  const viewRef = createForeignView(lContainer, 0);

  // 5. Call the RENDER function to get the nodes and DisposeFn
  const [nodes, dispose] = foreignComponent[RENDER](props);

  // 6. Insert the returned nodes into the foreign view, between its head and tail comment anchors.
  const tail = viewRef.tail;
  const parentNode = tail.parentNode;
  if (parentNode) {
    for (let i = 0; i < nodes.length; i++) {
      parentNode.insertBefore(nodes[i], tail);
    }
  }

  // 7. Register the DisposeFn in the foreign view's LView destroy hooks.
  if (dispose) {
    viewRef.onDestroy(dispose);
  }
}
