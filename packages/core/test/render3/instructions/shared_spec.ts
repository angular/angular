/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorHandler} from '@angular/core/src/core';
import {createInjector} from '@angular/core/src/di/r3_injector';
import {Writable} from '@angular/core/src/interface/type';
import {createLView, createTNode, createTView, handleError} from '@angular/core/src/render3/instructions/shared';
import {TNodeType} from '@angular/core/src/render3/interfaces/node';
import {domRendererFactory3} from '@angular/core/src/render3/interfaces/renderer';
import {HEADER_OFFSET, INJECTOR, LView, LViewFlags, TVIEW, TViewType} from '@angular/core/src/render3/interfaces/view';
import {enterView, getBindingRoot, getLView, setBindingIndex, setSelectedIndex} from '@angular/core/src/render3/state';
import {global} from '@angular/core/src/util/global';

describe('shared', () => {
  const savedConsole = global.console;
  let lView: LView;
  beforeEach(() => lView = new Array(HEADER_OFFSET) as any);
  afterEach(() => global.console = savedConsole);
  describe('handleError', () => {
    it('should rethrow if no console is present', () => {
      global.console = undefined;
      expect(() => handleError(lView, 'MY-ERROR')).toThrow('MY-ERROR');
    });

    it('should console.log if console.error is not present', () => {
      global.console = {log: jasmine.createSpy('log')};
      expect(() => handleError(lView, 'MY-ERROR')).not.toThrow();
      expect(global.console.log).toHaveBeenCalledWith('MY-ERROR');
    });

    it('should console.error if no injector', () => {
      global.console = {error: jasmine.createSpy('log')};
      expect(() => handleError(lView, 'MY-ERROR')).not.toThrow();
      expect(global.console.error).toHaveBeenCalledWith('MY-ERROR');
    });

    it('should console.error if injector but no ErrorHandler', () => {
      (lView as Writable<LView>)[INJECTOR] = createInjector(null);
      global.console = {error: jasmine.createSpy('log')};
      expect(() => handleError(lView, 'MY-ERROR')).not.toThrow();
      expect(global.console.error).toHaveBeenCalledWith('MY-ERROR');
    });
    it('should use ErrorHandler if present in injector', () => {
      const errorHandler: ErrorHandler = {handleError: jasmine.createSpy('handleError')} as any;
      (lView as Writable<LView>)[INJECTOR] =
          createInjector(null, null, [{provide: ErrorHandler, useValue: errorHandler}]);
      expect(() => handleError(lView, 'MY-ERROR')).not.toThrow();
      expect(errorHandler.handleError).toHaveBeenCalledWith('MY-ERROR');
    });
  });
});

/**
 * Setups a simple `LView` so that it is possible to do unit tests on instructions.
 *
 * ```
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
  const renderer = domRendererFactory3.createRenderer(null, null);
  const div = renderer.createElement('div');
  const consts = 1;
  const vars = 60;  // Space for directive expando,  template, component + 3 directives if we assume
                    // that each consume 10 slots.
  const tView = createTView(
      TViewType.Component, null, emptyTemplate, consts, vars, null, null, null, null, null);
  // Just assume that the expando starts after 10 initial bindings.
  tView.expandoStartIndex = HEADER_OFFSET + 10;
  const tNode = tView.firstChild = createTNode(tView, null!, TNodeType.Element, 0, 'div', null);
  const lView = createLView(
      null, tView, null, LViewFlags.CheckAlways, null, null, domRendererFactory3, renderer, null,
      null);
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
