/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ForeignComponent, RENDER} from '../../interface/foreign_component';
import {attachPatchData} from '../context_discovery';
import {nativeInsertBefore} from '../dom_node_manipulation';
import {createForeignView} from '../foreign_view';
import {TContainerNode, TNodeType} from '../interfaces/node';
import {HEADER_OFFSET, RENDERER, TVIEW, FLAGS} from '../interfaces/view';
import {appendChild} from '../node_manipulation';
import {getLView, getTView, setCurrentTNode, setCurrentTNodeAsNotParent} from '../state';
import {getOrCreateTNode} from '../tnode_manipulation';
import {addToEndOfViewTree} from '../view/construction';
import {createLContainer, addLViewToLContainer} from '../view/container';
import {NodeInjector} from '../di';
import {runInInjectionContext} from '../../di';
import {Renderer} from '../interfaces/renderer';
import {RElement, RNode} from '../interfaces/renderer_dom';
import {createAndRenderEmbeddedLView} from '../view_manipulation';
import {collectNativeNodes} from '../collect_native_nodes';
import {assertLContainer} from '../assert';
import {LContainer, LContainerFlags} from '../interfaces/container';

/**
 * Creation phase instruction to render a foreign component.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponent The matched foreign component.
 * @param props Aggregate properties and static attributes.
 * @codeGenApi
 */
export function ɵɵforeignComponent(
  index: number,
  foreignComponent: ForeignComponent<any>,
  props?: any,
): void {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;

  // 1. Get or create TNode for this container slot
  let tNode: TContainerNode;
  if (tView.firstCreatePass) {
    tNode = getOrCreateTNode(tView, adjustedIndex, TNodeType.Container, null, null);
    // `getOrCreateTNode` unconditionally sets the current node as a parent node, which it is not.
    setCurrentTNodeAsNotParent();
  } else {
    tNode = tView.data[adjustedIndex] as TContainerNode;
    setCurrentTNode(tNode, false);
  }

  // 2. Create the anchor node in the DOM
  const renderer = lView[RENDERER] as Renderer;
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
  const injector = new NodeInjector(tNode, lView);
  const [nodes, dispose] = runInInjectionContext(injector, () => foreignComponent[RENDER](props));

  // 6. Insert the returned nodes into the foreign view, between its head and tail comment anchors.
  const tail = viewRef.tail as RNode;
  const parent = tail.parentNode;
  if (parent) {
    for (let i = 0; i < nodes.length; i++) {
      nativeInsertBefore(renderer, parent, nodes[i], tail, false);
    }
  }

  // 7. Register the DisposeFn in the foreign view's LView destroy hooks.
  if (dispose) {
    viewRef.onDestroy(dispose);
  }
}

/**
 * Creation phase instruction to render foreign content (children of a foreign component)
 * and extract its root DOM nodes.
 *
 * @param index The index of the container in the data array.
 * @codeGenApi
 */
export function ɵɵforeignContent(index: number): any[] {
  const lView = getLView();
  const adjustedIndex = index + HEADER_OFFSET;

  // The template is already declared at adjustedIndex, so lContainer must exist.
  const lContainer = lView[adjustedIndex] as LContainer;
  ngDevMode && assertLContainer(lContainer);
  lContainer[FLAGS] |= LContainerFlags.LogicalOnly;

  const tView = getTView();
  const tNode = tView.data[adjustedIndex] as TContainerNode;

  // Instantiate and render the embedded view inside the container, but do not add its elements to
  // the DOM at the container anchor since the nodes will be projected into a foreign view.
  const embeddedLView = createAndRenderEmbeddedLView(lView, tNode, null);
  addLViewToLContainer(lContainer, embeddedLView, 0, /* addToDOM */ false);

  // Extract and return the root nodes of the created view
  const embeddedTView = embeddedLView[TVIEW];
  return collectNativeNodes(embeddedTView, embeddedLView, embeddedTView.firstChild, []);
}
