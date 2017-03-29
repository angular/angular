/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {el, stringifyElement} from '@angular/platform-browser/testing/src/browser_util';

export function main() {
  describe('dom adapter', () => {
    let defaultDoc: any;
    beforeEach(() => {
      defaultDoc = getDOM().supportsDOMEvents() ? document : getDOM().createHtmlDocument();
    });

    it('should not coalesque text nodes', () => {
      const el1 = el('<div>a</div>');
      const el2 = el('<div>b</div>');
      getDOM().appendChild(el2, getDOM().firstChild(el1));
      expect(getDOM().childNodes(el2).length).toBe(2);

      const el2Clone = getDOM().clone(el2);
      expect(getDOM().childNodes(el2Clone).length).toBe(2);
    });

    it('should clone correctly', () => {
      const el1 = el('<div x="y">a<span>b</span></div>');
      const clone = getDOM().clone(el1);

      expect(clone).not.toBe(el1);
      getDOM().setAttribute(clone, 'test', '1');
      expect(stringifyElement(clone)).toEqual('<div test="1" x="y">a<span>b</span></div>');
      expect(getDOM().getAttribute(el1, 'test')).toBeFalsy();

      const cNodes = getDOM().childNodes(clone);
      const firstChild = cNodes[0];
      const secondChild = cNodes[1];
      expect(getDOM().parentElement(firstChild)).toBe(clone);
      expect(getDOM().nextSibling(firstChild)).toBe(secondChild);
      expect(getDOM().isTextNode(firstChild)).toBe(true);

      expect(getDOM().parentElement(secondChild)).toBe(clone);
      expect(getDOM().nextSibling(secondChild)).toBeFalsy();
      expect(getDOM().isElementNode(secondChild)).toBe(true);

    });

    it('should be able to create text nodes and use them with the other APIs', () => {
      const t = getDOM().createTextNode('hello');
      expect(getDOM().isTextNode(t)).toBe(true);
      const d = getDOM().createElement('div');
      getDOM().appendChild(d, t);
      expect(getDOM().getInnerHTML(d)).toEqual('hello');
    });

    it('should set className via the class attribute', () => {
      const d = getDOM().createElement('div');
      getDOM().setAttribute(d, 'class', 'class1');
      expect(d.className).toEqual('class1');
    });

    it('should allow to remove nodes without parents', () => {
      const d = getDOM().createElement('div');
      expect(() => getDOM().remove(d)).not.toThrow();
    });

    it('should parse styles with urls correctly', () => {
      const d = getDOM().createElement('div');
      getDOM().setStyle(d, 'background-url', 'url(http://test.com/bg.jpg)');
      expect(getDOM().getStyle(d, 'background-url')).toBe('url(http://test.com/bg.jpg)');
    });

    if (getDOM().supportsDOMEvents()) {
      describe('getBaseHref', () => {
        beforeEach(() => getDOM().resetBaseElement());

        it('should return null if base element is absent',
           () => { expect(getDOM().getBaseHref(defaultDoc)).toBeNull(); });

        it('should return the value of the base element', () => {
          const baseEl = getDOM().createElement('base');
          getDOM().setAttribute(baseEl, 'href', '/drop/bass/connon/');
          const headEl = defaultDoc.head;
          getDOM().appendChild(headEl, baseEl);

          const baseHref = getDOM().getBaseHref(defaultDoc);
          getDOM().removeChild(headEl, baseEl);
          getDOM().resetBaseElement();

          expect(baseHref).toEqual('/drop/bass/connon/');
        });

        it('should return a relative url', () => {
          const baseEl = getDOM().createElement('base');
          getDOM().setAttribute(baseEl, 'href', 'base');
          const headEl = defaultDoc.head;
          getDOM().appendChild(headEl, baseEl);

          const baseHref = getDOM().getBaseHref(defaultDoc) !;
          getDOM().removeChild(headEl, baseEl);
          getDOM().resetBaseElement();

          expect(baseHref.endsWith('/base')).toBe(true);
        });
      });
    }


  });
}
