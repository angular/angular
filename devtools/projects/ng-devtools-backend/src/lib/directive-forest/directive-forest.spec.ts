/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵExternalCoreGlobalUtils} from '@angular/core';
import {getRootElements} from '.';

type Ng = ɵExternalCoreGlobalUtils;
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

describe('directive-forest', () => {
  afterEach(() => {
    delete (globalThis as any).ng;
  });

  describe('getRootElements', () => {
    beforeEach(() => {
      const ng: Partial<Ng> = {
        getComponent: jasmine.createSpy('getComponent').and.callFake((element: HTMLElement) => {
          // Will treat only `ng-*` elements as Angular components.
          if (element.tagName.toLowerCase().startsWith('ng-')) {
            return element;
          }
          return null;
        }),
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

    it('should return all root elements with all non-application root components', () => {
      const rootElement = createRoot();
      const childElement = createRoot();
      const nonAppRootCmp = document.createElement('ng-cmp');

      rootElement.appendChild(childElement);
      document.body.appendChild(rootElement);
      document.body.appendChild(nonAppRootCmp);

      const roots = getRootElements();

      expect(roots.length).toEqual(2);
      expect(roots).toEqual([rootElement, nonAppRootCmp]);
    });
  });
});
