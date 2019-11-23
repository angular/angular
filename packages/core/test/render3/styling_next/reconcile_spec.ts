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

function getSortedClassName(element: HTMLElement): string {
  const names: string[] = [];
  const classList = element.classList || [];
  for (let i = 0; i < classList.length; i++) {
    const name = classList[i];
    if (names.indexOf(name) === -1) {
      names.push(name);
    }
  }
  names.sort();
  return names.join(' ');
}

function getSortedStyle(element: HTMLElement): string {
  const names: string[] = [];
  const style = element.style;
  // reading `style.color` is a work around for a bug in Domino. The issue is that Domino has stale
  // value for `style.length`. It seems that reading a property from the element causes the stale
  // value to be updated. (As of Domino v 2.1.3)
  style.color;
  for (let i = 0; i < style.length; i++) {
    const name = style.item(i);
    if (names.indexOf(name) === -1) {
      names.push(name);
    }
  }
  names.sort();
  let sorted = '';
  names.forEach(key => {
    const value = style.getPropertyValue(key);
    if (value != null && value !== '') {
      if (sorted !== '') sorted += ' ';
      sorted += key + ': ' + value + ';';
    }
  });
  return sorted;
}