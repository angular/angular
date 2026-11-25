/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵExternalCoreGlobalUtils,
  ɵHydratedNode as HydrationNode,
  ɵHydrationStatus as HydrationStatus,
} from '@angular/core';
import {getHydrationMismatchHighlightElement, getHydrationMismatchNode, getRootElements} from '.';

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

  describe('hydration mismatch node resolution', () => {
    it('should return null when node is not mismatched', () => {
      const host = document.createElement('app-root');
      expect(getHydrationMismatchNode(host)).toBeNull();
      (host as HydrationNode).__ngDebugHydrationInfo__ = {status: HydrationStatus.Hydrated};
      expect(getHydrationMismatchNode(host)).toBeNull();
    });

    it('should resolve the live mismatch element and fall back to parentElement for text nodes', () => {
      const host = document.createElement('app-root');
      const wrapper = document.createElement('div');
      const text = document.createTextNode('hi');
      wrapper.appendChild(text);
      host.appendChild(wrapper);

      (host as HydrationNode).__ngDebugHydrationInfo__ = {
        status: HydrationStatus.Mismatched,
        expectedNodeDetails: null,
        actualNodeDetails: null,
        actualNode: new WeakRef(wrapper),
      };
      expect(getHydrationMismatchNode(host)).toBe(wrapper);
      expect(getHydrationMismatchHighlightElement(host)).toBe(wrapper);

      (host as HydrationNode).__ngDebugHydrationInfo__ = {
        status: HydrationStatus.Mismatched,
        expectedNodeDetails: null,
        actualNodeDetails: null,
        actualNode: new WeakRef(text),
      };
      expect(getHydrationMismatchNode(host)).toBe(text);
      expect(getHydrationMismatchHighlightElement(host)).toBe(wrapper);
    });

    it('should fall back to the host element when actualNode is absent', () => {
      const host = document.createElement('app-root');
      (host as HydrationNode).__ngDebugHydrationInfo__ = {
        status: HydrationStatus.Mismatched,
        expectedNodeDetails: '<b>expected</b>',
        actualNodeDetails: '<span>actual</span>',
      };
      expect(getHydrationMismatchNode(host)).toBeNull();
      expect(getHydrationMismatchHighlightElement(host)).toBe(host);
    });
  });
});
