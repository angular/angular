/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TNodeType} from '../../../src/render3/interfaces/node';
import {HEADER_OFFSET, LViewFlags, TVIEW, TViewType} from '../../../src/render3/interfaces/view';
import {
  enterView,
  getBindingRoot,
  getLView,
  setBindingIndex,
  setSelectedIndex,
} from '../../../src/render3/state';

import {MockRendererFactory} from './mock_renderer_factory';
import {createTNode} from '../../../src/render3/tnode_manipulation';
import {createLView, createTView} from '../../../src/render3/view/construction';

/**
 * Setups a simple `LView` so that it is possible to do unit tests on instructions.
 *
 * ```ts
 * describe('styling', () => {
 *  beforeEach(enterViewWithOneDiv);
 *  afterEach(leaveView);
 *
 *  it('should ...', () => {
 *     expect(getLView()).toBeDefined();
 *     const div = getNativeByIndex(1, getLView());
 *   });
 * });
 * ```
 */
export function enterViewWithOneDiv() {
  const rendererFactory = new MockRendererFactory();
  const renderer = rendererFactory.createRenderer(null, null);
  const div = renderer.createElement('div');
  const consts = 1;
  const vars = 60; // Space for directive expando,  template, component + 3 directives if we assume
  // that each consume 10 slots.
  const tView = createTView(
    TViewType.Component,
    null,
    emptyTemplate,
    consts,
    vars,
    null,
    null,
    null,
    null,
    null,
    null,
  );
  // Just assume that the expando starts after 10 initial bindings.
  tView.expandoStartIndex = HEADER_OFFSET + 10;
  const tNode = (tView.firstChild = createTNode(tView, null!, TNodeType.Element, 0, 'div', null));
  const lView = createLView(
    null,
    tView,
    null,
    LViewFlags.CheckAlways,
    null,
    null,
    {
      rendererFactory,
      sanitizer: null,
      changeDetectionScheduler: null,
      ngReflect: false,
    },
    renderer,
    null,
    null,
    null,
  );
  lView[HEADER_OFFSET] = div;
  tView.data[HEADER_OFFSET] = tNode;
  enterView(lView);
  setSelectedIndex(HEADER_OFFSET);
}

export function clearFirstUpdatePass() {
  getLView()[TVIEW].firstUpdatePass = false;
}
export function rewindBindingIndex() {
  setBindingIndex(getBindingRoot());
}

function emptyTemplate() {}
