/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {el, isTextNode, stringifyElement} from '@angular/platform-browser/testing/src/browser_util';

{
  describe('dom adapter', () => {
    let defaultDoc: any;
    beforeEach(() => {
      defaultDoc = getDOM().supportsDOMEvents() ? document : getDOM().createHtmlDocument();
    });

    it('should be able to create text nodes and use them with the other APIs', () => {
      const t = getDOM().createTextNode('hello');
      expect(isTextNode(t)).toBe(true);
      const d = getDOM().createElement('div');
      getDOM().appendChild(d, t);
      expect(d.innerHTML).toEqual('hello');
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

    // Test for regression caused by angular/angular#22536
    it('should parse styles correctly following the spec', () => {
      const d = getDOM().createElement('div');
      getDOM().setStyle(d, 'background-image', 'url("paper.gif")');
      expect(d.style.backgroundImage).toBe('url("paper.gif")');
      expect(d.style.getPropertyValue('background-image')).toBe('url("paper.gif")');
      expect(getDOM().getStyle(d, 'background-image')).toBe('url("paper.gif")');
    });

    it('should parse camel-case styles correctly', () => {
      const d = getDOM().createElement('div');
      getDOM().setStyle(d, 'marginRight', '10px');
      expect(getDOM().getStyle(d, 'margin-right')).toBe('10px');
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
