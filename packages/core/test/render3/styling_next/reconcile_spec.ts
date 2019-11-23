/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Renderer3, domRendererFactory3} from '@angular/core/src/render3/interfaces/renderer';
import {writeAndReconcileClass, writeAndReconcileStyle} from '@angular/core/src/render3/styling/reconcile';

describe('styling reconcile', () => {
  [document, domRendererFactory3.createRenderer(null, null)].forEach((renderer: Renderer3) => {
    const element = document.createElement('div');
    beforeEach(() => {
      element.className = '';
      element.style.cssText = '';
    });

    describe('writeAndReconcileClass', () => {
      it('should write new value to DOM', () => {
        writeAndReconcileClass(renderer, element, '', 'A');
        expect(element.className).toEqual('A');

        writeAndReconcileClass(renderer, element, 'A', 'C B A');
        expect(element.className).toEqual('C B A');

        writeAndReconcileClass(renderer, element, 'C B A', '');
        expect(element.className).toEqual('');
      });

      it('should write value alphabetically when existing class present', () => {
        element.className = 'X';
        writeAndReconcileClass(renderer, element, '', 'A');
        expect(element.className).toEqual('X A');

        writeAndReconcileClass(renderer, element, 'A', 'C B A');
        expect(element.className).toEqual('X A B C');

        writeAndReconcileClass(renderer, element, 'C B A', '');
        expect(element.className).toEqual('X');
      });

    });

    describe('writeAndReconcileStyle', () => {
      it('should write new value to DOM', () => {
        writeAndReconcileStyle(renderer, element, '', 'width: 100px;');
        expect(element.style.cssText).toEqual('width: 100px;');

        writeAndReconcileStyle(
            renderer, element, 'width: 100px;', 'color: red; height: 100px; width: 100px;');
        expect(element.style.cssText).toEqual('color: red; height: 100px; width: 100px;');

        writeAndReconcileStyle(renderer, element, 'color: red; height: 100px; width: 100px;', '');
        expect(element.style.cssText).toEqual('');
      });

      it('should not clobber out of bound styles', () => {
        element.style.cssText = 'color: red;';
        writeAndReconcileStyle(renderer, element, '', 'width: 100px;');
        expect(element.style.cssText).toEqual('color: red; width: 100px;');

        writeAndReconcileStyle(renderer, element, 'width: 100px;', 'width: 100px; height: 100px;');
        expect(element.style.cssText).toEqual('color: red; width: 100px; height: 100px;');

        writeAndReconcileStyle(renderer, element, 'width: 100px; height: 100px;', '');
        expect(element.style.cssText).toEqual('color: red;');
      });
    });
  });
});