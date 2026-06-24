/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, ɵGlobalDevModeUtils} from '@angular/core';
import {getInjectorFromElementNode, getRootElements} from './component-tree';

type Ng = ɵGlobalDevModeUtils['ng'];
const NG_VERSION = 'ng-version';
const VERSION = '0.0.0-PLACEHOLDER';

function setNgVersion(element: Element) {
  element.setAttribute(NG_VERSION, VERSION);
}

function createRoot() {
  const root = document.createElement('div');
  setNgVersion(root);
  return root;
}

describe('component-tree', () => {
  afterEach(() => {
    delete (globalThis as any).ng;
  });

  describe('getInjectorFromElementNode', () => {
    it('returns injector', () => {
      const injector = Injector.create({
        providers: [],
      });

      const ng: Partial<Ng> = {
        getInjector: jasmine.createSpy('getInjector').and.returnValue(injector),
      };
      (globalThis as any).ng = ng;

      const el = document.createElement('div');
      expect(getInjectorFromElementNode(el)).toBe(injector);
      expect(ng.getInjector).toHaveBeenCalledOnceWith(el);
    });

    it('returns `null` when `getInjector` is not supported', () => {
      (globalThis as any).ng = {};

      const el = document.createElement('div');
      expect(getInjectorFromElementNode(el)).toBeNull();
    });
  });

  describe('getRootElements', () => {
    beforeEach(() => {
      const ng: Partial<Ng> = {
        getComponent: jasmine.createSpy('getComponent').and.returnValue({}),
      };
      (window as any).ng = ng;
    });

    afterEach(() => {
      document.body.replaceChildren();
      document.body.removeAttribute(NG_VERSION);
      delete (window as any).ng;
    });

    it('should return root element', () => {
      const rootElement = createRoot();
      const childElement = createRoot();

      rootElement.appendChild(childElement);
      document.body.appendChild(rootElement);

      const roots = getRootElements();

      expect(roots.length).toEqual(1);
      expect(roots.pop()).toEqual(rootElement);
    });

    it('should return multiple sibling roots', () => {
      const firstRoot = createRoot();
      const secondRoot = createRoot();

      document.body.appendChild(firstRoot);
      document.body.appendChild(secondRoot);

      const roots = getRootElements();

      expect(roots.length).toEqual(2);
      expect(roots).toContain(firstRoot);
      expect(roots).toContain(secondRoot);
    });

    it('should only return document.body when document.body is the root', () => {
      setNgVersion(document.body);
      const child1 = createRoot();
      document.body.appendChild(child1);
      const roots = getRootElements();
      expect(roots.length).toEqual(1);
      expect(roots).toContain(document.body);
    });
  });
});
