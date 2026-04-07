/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {isTextNode} from '@angular/private/testing';

describe('dom adapter', () => {
  let defaultDoc: any;
  beforeEach(() => {
    defaultDoc = getDOM().supportsDOMEvents ? document : getDOM().createHtmlDocument();
  });

  it('should be able to create text nodes and use them with the other APIs', () => {
    const t = getDOM().getDefaultDocument().createTextNode('hello');
    expect(isTextNode(t)).toBe(true);
    const d = getDOM().createElement('div');
    d.appendChild(t);
    expect(d.innerHTML).toEqual('hello');
  });

  it('should set className via the class attribute', () => {
    const d = getDOM().createElement('div');
    d.setAttribute('class', 'class1');
    expect(d.className).toEqual('class1');
  });

  it('should allow to remove nodes without parents', () => {
    const d = getDOM().createElement('div');
    expect(() => getDOM().remove(d)).not.toThrow();
  });

  if (getDOM().supportsDOMEvents) {
    describe('getBaseHref', () => {
      beforeEach(() => getDOM().resetBaseElement());

      it('should return null if base element is absent', () => {
        expect(getDOM().getBaseHref(defaultDoc)).toBeNull();
      });

      it('should return the value of the base element', () => {
        const baseEl = getDOM().createElement('base');
        baseEl.setAttribute('href', '/drop/bass/connon/');
        const headEl = defaultDoc.head;
        headEl.appendChild(baseEl);

        const baseHref = getDOM().getBaseHref(defaultDoc);
        baseEl.remove();
        getDOM().resetBaseElement();

        expect(baseHref).toEqual('/drop/bass/connon/');
      });

      it('should return a relative url', () => {
        const baseEl = getDOM().createElement('base');
        baseEl.setAttribute('href', 'base');
        const headEl = defaultDoc.head;
        headEl.appendChild(baseEl);

        const baseHref = getDOM().getBaseHref(defaultDoc)!;
        baseEl.remove();
        getDOM().resetBaseElement();

        expect(baseHref.endsWith('/base')).toBe(true);
      });
    });
  }
});
