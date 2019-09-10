/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {addToViewTree, createLContainer, createLView, createTNode, createTView, getOrCreateTNode, renderView} from '../../../src/render3/instructions/shared';
import {ComponentTemplate} from '../../../src/render3/interfaces/definition';
import {TNodeType, TViewNode} from '../../../src/render3/interfaces/node';
import {RComment} from '../../../src/render3/interfaces/renderer';
import {LView, LViewFlags, TView} from '../../../src/render3/interfaces/view';
import {insertView} from '../../../src/render3/node_manipulation';

import {NoopRenderer, NoopRendererFactory, WebWorkerRenderNode} from './noop_renderer';

export function createAndRenderLView(
    parentLView: LView | null, tView: TView, hostTNode: TViewNode) {
  const embeddedLView = createLView(
      parentLView, tView, {}, LViewFlags.CheckAlways, null, hostTNode, new NoopRendererFactory(),
      new NoopRenderer());
  renderView(embeddedLView, tView, null);
}

export function setupRootViewWithEmbeddedViews(
    templateFn: ComponentTemplate<any>| null, consts: number, vars: number, noOfViews: number,
    embeddedViewContext: any = {}): LView {
  // Create a root view with a container
  const rootTView = createTView(-1, null, 1, 0, null, null, null, null);
  const tContainerNode = getOrCreateTNode(rootTView, null, 0, TNodeType.Container, null, null);
  const rootLView = createLView(
      null, rootTView, {}, LViewFlags.CheckAlways | LViewFlags.IsRoot, null, null,
      new NoopRendererFactory(), new NoopRenderer());
  const mockRNode = new WebWorkerRenderNode();
  const lContainer = createLContainer(
      mockRNode as RComment, rootLView, mockRNode as RComment, tContainerNode, true);
  addToViewTree(rootLView, lContainer);


  // create test embedded views
  const embeddedTView = createTView(-1, templateFn, consts, vars, null, null, null, null);
  const viewTNode = createTNode(rootTView, null, TNodeType.View, -1, null, null) as TViewNode;

  // create embedded views and add them to the container
  for (let i = 0; i < noOfViews; i++) {
    const embeddedLView = createLView(
        rootLView, embeddedTView, embeddedViewContext, LViewFlags.CheckAlways, null, viewTNode,
        new NoopRendererFactory(), new NoopRenderer());
    renderView(embeddedLView, embeddedTView, null);
    insertView(embeddedLView, lContainer, i);
  }

  // run in the creation mode to set flags etc.
  renderView(rootLView, rootTView, null);

  return rootLView;
}