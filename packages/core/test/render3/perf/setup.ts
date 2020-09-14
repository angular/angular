/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {addToViewTree, createLContainer, createLView, createTNode, createTView, getOrCreateTNode, refreshView, renderView} from '../../../src/render3/instructions/shared';
import {ComponentTemplate, DirectiveDefList} from '../../../src/render3/interfaces/definition';
import {TAttributes, TElementNode, TNodeType} from '../../../src/render3/interfaces/node';
import {domRendererFactory3, RendererFactory3} from '../../../src/render3/interfaces/renderer';
import {LView, LViewFlags, TVIEW, TView, TViewType} from '../../../src/render3/interfaces/view';
import {insertView} from '../../../src/render3/node_manipulation';

import {MicroBenchmarkRendererFactory} from './noop_renderer';

const isBrowser = typeof process === 'undefined';
const rendererFactory: RendererFactory3 =
    isBrowser ? domRendererFactory3 : new MicroBenchmarkRendererFactory;
const renderer = rendererFactory.createRenderer(null, null);

export function createAndRenderLView(
    parentLView: LView, tView: TView, hostTNode: TElementNode): LView {
  const embeddedLView = createLView(
      parentLView, tView, {}, LViewFlags.CheckAlways, null, hostTNode, rendererFactory, renderer,
      null, null);
  renderView(tView, embeddedLView, null);
  return embeddedLView;
}

export function setupRootViewWithEmbeddedViews(
    templateFn: ComponentTemplate<any>|null, decls: number, vars: number, noOfViews: number,
    embeddedViewContext: any = {}, consts: TAttributes[]|null = null,
    directiveRegistry: DirectiveDefList|null = null): LView {
  return setupTestHarness(
             templateFn, decls, vars, noOfViews, embeddedViewContext, consts, directiveRegistry)
      .hostLView;
}

export interface TestHarness {
  hostLView: LView;
  hostTView: TView;
  embeddedTView: TView;
  createEmbeddedLView(): LView;
  detectChanges(): void;
}

export function setupTestHarness(
    templateFn: ComponentTemplate<any>|null, decls: number, vars: number, noOfViews: number,
    embeddedViewContext: any = {}, consts: TAttributes[]|null = null,
    directiveRegistry: DirectiveDefList|null = null): TestHarness {
  // Create a root view with a container
  const hostTView = createTView(TViewType.Root, null, null, 1, 0, null, null, null, null, consts);
  const tContainerNode = getOrCreateTNode(hostTView, 0, TNodeType.Container, null, null);
  const hostNode = renderer.createElement('div');
  const hostLView = createLView(
      null, hostTView, {}, LViewFlags.CheckAlways | LViewFlags.IsRoot, hostNode, null,
      rendererFactory, renderer, null, null);
  const mockRCommentNode = renderer.createComment('');
  const lContainer =
      createLContainer(mockRCommentNode, hostLView, mockRCommentNode, tContainerNode);
  addToViewTree(hostLView, lContainer);


  // create test embedded views
  const embeddedTView = createTView(
      TViewType.Embedded, null, templateFn, decls, vars, directiveRegistry, null, null, null,
      consts);
  const viewTNode = createTNode(hostTView, null, TNodeType.Element, -1, null, null);

  function createEmbeddedLView(): LView {
    const embeddedLView = createLView(
        hostLView, embeddedTView, embeddedViewContext, LViewFlags.CheckAlways, null, viewTNode,
        rendererFactory, renderer, null, null);
    renderView(embeddedTView, embeddedLView, embeddedViewContext);
    return embeddedLView;
  }

  function detectChanges(): void {
    refreshView(hostTView, hostLView, hostTView.template, embeddedViewContext);
  }

  // create embedded views and add them to the container
  for (let i = 0; i < noOfViews; i++) {
    const lView = createEmbeddedLView();
    insertView(lView[TVIEW], lView, lContainer, i);
  }

  return {
    hostLView: hostLView,
    hostTView: hostTView,
    embeddedTView: embeddedTView,
    createEmbeddedLView: createEmbeddedLView,
    detectChanges: detectChanges,
  };
}
