/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentTemplate} from '@angular/core/src/render3';
import {createLView, createTNode, createTView} from '@angular/core/src/render3/instructions/shared';
import {TConstants, TElementNode, TNodeType} from '@angular/core/src/render3/interfaces/node';
import {domRendererFactory3} from '@angular/core/src/render3/interfaces/renderer';
import {LView, LViewFlags, T_HOST, TView, TViewType} from '@angular/core/src/render3/interfaces/view';
import {enterView, leaveView, specOnlyIsInstructionStateEmpty} from '@angular/core/src/render3/state';
import {noop} from '@angular/core/src/util/noop';

/**
 * Fixture useful for testing operations which need `LView` / `TView`
 */
export class ViewFixture {
  /**
   * Clean up the `LFrame` stack between tests.
   */
  static cleanUp() {
    while (!specOnlyIsInstructionStateEmpty()) {
      leaveView();
    }
  }

  /**
   * DOM element which acts as a host to the `LView`.
   */
  host: HTMLElement;

  tView: TView;

  lView: LView;

  constructor({template, decls, vars, consts, context}: {
    decls?: number,
    vars?: number,
    template?: ComponentTemplate<any>,
    consts?: TConstants,
    context?: {}
  } = {}) {
    const hostRenderer = domRendererFactory3.createRenderer(null, null);
    this.host = hostRenderer.createElement('host-element') as HTMLElement;
    const hostTView = createTView(TViewType.Root, null, null, 1, 0, null, null, null, null, null);
    const hostLView = createLView(
        null, hostTView, {}, LViewFlags.CheckAlways | LViewFlags.IsRoot, null, null,
        domRendererFactory3, hostRenderer, null, null);


    this.tView = createTView(
        TViewType.Component, null, template || noop, decls || 0, vars || 0, null, null, null, null,
        consts || null);
    const hostTNode =
        createTNode(hostTView, null, TNodeType.Element, 0, 'host-element', null) as TElementNode;
    this.lView = createLView(
        hostLView, this.tView, context || {}, LViewFlags.CheckAlways, this.host, hostTNode,
        domRendererFactory3, hostRenderer, null, null);
  }

  /**
   * If you use `ViewFixture` and `enter()`, please add `afterEach(ViewFixture.cleanup);` to ensure
   * that he global `LFrame` stack gets cleaned up between the tests.
   */
  enterView() {
    enterView(this.lView);
  }

  leaveView() {
    leaveView();
  }

  apply(fn: () => void) {
    this.enterView();
    try {
      fn();
    } finally {
      this.leaveView();
    }
  }
}