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
import {LView, LViewEnvironment, LViewFlags, TVIEW, TView, TViewType} from '../../../src/render3/interfaces/view';
import {insertView} from '../../../src/render3/node_manipulation';
import {EffectManager} from '../../../src/render3/reactivity/effect';

import {MicroBenchmarkDomRendererFactory, MicroBenchmarkRendererFactory} from './noop_renderer';

const isBrowser = typeof process === 'undefined';
const rendererFactory =
    isBrowser ? new MicroBenchmarkDomRendererFactory() : new MicroBenchmarkRendererFactory();
const renderer = rendererFactory.createRenderer(null, null);

const environment: LViewEnvironment = {
  rendererFactory,
  sanitizer: null,
  effectManager: new EffectManager(),
};

export function createAndRenderLView(
    parentLView: LView, tView: TView, hostTNode: TElementNode): LView {
  const embeddedLView = createLView(
      parentLView, tView, {}, LViewFlags.CheckAlways, null, hostTNode, environment, renderer, null,
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
  const hostTView =
      createTView(TViewType.Root, null, null, 1, 0, null, null, null, null, consts, null);
  const tContainerNode = getOrCreateTNode(hostTView, 0, TNodeType.Container, null, null);
  const hostNode = renderer.createElement('div');
  const hostLView = createLView(
      null, hostTView, {}, LViewFlags.CheckAlways | LViewFlags.IsRoot, hostNode, null, environment,
      renderer, null, null, null);
  const mockRCommentNode = renderer.createComment('');
  const lContainer =
      createLContainer(mockRCommentNode, hostLView, mockRCommentNode, tContainerNode);
  addToViewTree(hostLView, lContainer);


  // create test embedded views
  const embeddedTView = createTView(
      TViewType.Embedded, null, templateFn, decls, vars, directiveRegistry, null, null, null,
      consts, null);
  const viewTNode = createTNode(hostTView, null, TNodeType.Element, -1, null, null);

  function createEmbeddedLView(): LView {
    const embeddedLView = createLView(
        hostLView, embeddedTView, embeddedViewContext, LViewFlags.CheckAlways, null, viewTNode,
        environment, renderer, null, null, null);
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
