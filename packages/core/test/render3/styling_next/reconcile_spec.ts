/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Renderer3, domRendererFactory3} from '@angular/core/src/render3/interfaces/renderer';
import {writeAndReconcileClass, writeAndReconcileStyle} from '@angular/core/src/render3/styling/reconcile';
import {getSortedClassName, getSortedStyle} from '@angular/core/testing/src/styling';

describe('styling reconcile', () => {
  [document, domRendererFactory3.createRenderer(null, null)].forEach((renderer: Renderer3) => {
    let element: HTMLDivElement;
    beforeEach(() => { element = document.createElement('div'); });

    describe('writeAndReconcileClass', () => {
      it('should write new value to DOM', () => {
        writeAndReconcileClass(renderer, element, '', 'A');
        expect(getSortedClassName(element)).toEqual('A');

        writeAndReconcileClass(renderer, element, 'A', 'C B A');
        expect(getSortedClassName(element)).toEqual('A B C');

        writeAndReconcileClass(renderer, element, 'C B A', '');
        expect(getSortedClassName(element)).toEqual('');
      });

      it('should write value alphabetically when existing class present', () => {
        element.className = 'X';
        writeAndReconcileClass(renderer, element, '', 'A');
        expect(getSortedClassName(element)).toEqual('A X');

        writeAndReconcileClass(renderer, element, 'A', 'C B A');
        expect(getSortedClassName(element)).toEqual('A B C X');

        writeAndReconcileClass(renderer, element, 'C B A', '');
        expect(getSortedClassName(element)).toEqual('X');
      });

    });

    describe('writeAndReconcileStyle', () => {
      it('should write new value to DOM', () => {
        writeAndReconcileStyle(renderer, element, '', 'width: 100px;');
        expect(getSortedStyle(element)).toEqual('width: 100px;');

        writeAndReconcileStyle(
            renderer, element, 'width: 100px;', 'color: red; height: 100px; width: 100px;');
        expect(getSortedStyle(element)).toEqual('color: red; height: 100px; width: 100px;');

        writeAndReconcileStyle(renderer, element, 'color: red; height: 100px; width: 100px;', '');
        expect(getSortedStyle(element)).toEqual('');
      });

      it('should not clobber out of bound styles', () => {
        element.style.cssText = 'color: red;';
        writeAndReconcileStyle(renderer, element, '', 'width: 100px;');
        expect(getSortedStyle(element)).toEqual('color: red; width: 100px;');

        writeAndReconcileStyle(renderer, element, 'width: 100px;', 'width: 200px;');
        expect(getSortedStyle(element)).toEqual('color: red; width: 200px;');

        writeAndReconcileStyle(renderer, element, 'width: 200px;', 'width: 200px; height: 100px;');
        expect(getSortedStyle(element)).toEqual('color: red; height: 100px; width: 200px;');

        writeAndReconcileStyle(renderer, element, 'width: 200px; height: 100px;', '');
        expect(getSortedStyle(element)).toEqual('color: red;');
      });

      it('should support duplicate styles', () => {
        element.style.cssText = 'color: red;';
        writeAndReconcileStyle(renderer, element, '', 'width: 100px; width: 200px;');
        expect(getSortedStyle(element)).toEqual('color: red; width: 200px;');

        writeAndReconcileStyle(
            renderer, element, 'width: 100px; width: 200px;',
            'width: 100px; width: 200px; height: 100px;');
        expect(getSortedStyle(element)).toEqual('color: red; height: 100px; width: 200px;');

        writeAndReconcileStyle(renderer, element, 'width: 100px; height: 100px;', '');
        expect(getSortedStyle(element)).toEqual('color: red;');
      });
    });
  });
});
