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
        expectClassName(element).toEqual('A');

        writeAndReconcileClass(renderer, element, 'A', 'C B A');
        expectClassName(element).toEqual('A B C');

        writeAndReconcileClass(renderer, element, 'C B A', '');
        expectClassName(element).toEqual('');
      });

      it('should write value alphabetically when existing class present', () => {
        element.className = 'X';
        writeAndReconcileClass(renderer, element, '', 'A');
        expectClassName(element).toEqual('A X');

        writeAndReconcileClass(renderer, element, 'A', 'C B A');
        expectClassName(element).toEqual('A B C X');

        writeAndReconcileClass(renderer, element, 'C B A', '');
        expectClassName(element).toEqual('X');
      });

    });

    describe('writeAndReconcileStyle', () => {
      it('should write new value to DOM', () => {
        writeAndReconcileStyle(renderer, element, '', 'width: 100px');
        expectStyle(element).toEqual('width: 100px');

        writeAndReconcileStyle(
            renderer, element, 'width: 100px;', 'color: red; height: 100px; width: 100px');
        expectStyle(element).toEqual('color: red; height: 100px; width: 100px');

        writeAndReconcileStyle(renderer, element, 'color: red; height: 100px; width: 100px', '');
        expectStyle(element).toEqual('');
      });

      it('should not clobber out of bound styles', () => {
        element.style.cssText = 'color: red;';
        writeAndReconcileStyle(renderer, element, '', 'width: 100px');
        expectStyle(element).toEqual('color: red; width: 100px');

        writeAndReconcileStyle(renderer, element, 'width: 100px;', 'height: 100px; width: 100px');
        expectStyle(element).toEqual('color: red; height: 100px; width: 100px');

        writeAndReconcileStyle(renderer, element, 'width: 100px; height: 100px', '');
        expectStyle(element).toEqual('color: red');
      });
    });
  });
});

function expectClassName(element: HTMLElement) {
  return expect(element.className.split(/\s+/).sort().join(' '));
}

function expectStyle(element: HTMLElement) {
  let entries: {prop: string, value: string}[] = [];
  const tokens = element.style.cssText.split(/[:;]/);
  for (let i = 0; i < tokens.length; i += 2) {
    const prop = tokens[i].trim();
    if (prop.length) {  // the last value in the split may be an empty string
      const value = tokens[i + 1].trim();
      entries.push({prop, value});
    }
  }

  entries = entries.sort((a, b) => a.prop > b.prop ? 1 : -1);
  const result = entries.reduce((str, entry) => {
    return str + (str.length ? '; ' : '') + `${entry.prop}: ${entry.value}`;
  }, '');

  return expect(result);
}
