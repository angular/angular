/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as highlighter from './highlighter';
describe('highlighter', () => {
  describe('findComponentAndHost', () => {
    it('should return undefined when no node is provided', () => {
      expect(highlighter.findComponentAndHost(undefined)).toEqual({component: null, host: null});
    });
    it('should return same component and host if component exists', () => {
      window.ng = {
        getComponent: (el) => el,
      };
      const element = document.createElement('div');
      const data = highlighter.findComponentAndHost(element);
      expect(data.component).toBeTruthy();
      expect(data.host).toBeTruthy();
      expect(data.component).toEqual(data.host);
    });
    it('should return null component and host if component do not exists', () => {
      window.ng = {
        getComponent: () => undefined,
      };
      const element = document.createElement('div');
      const data = highlighter.findComponentAndHost(element);
      expect(data.component).toBeFalsy();
      expect(data.host).toBeFalsy();
    });
  });
  describe('getComponentName', () => {
    it('should return null when called with null values', () => {
      let name = highlighter.getDirectiveName(null);
      expect(name).toBe('unknown');
      name = highlighter.getDirectiveName(undefined);
      expect(name).toBe('unknown');
    });
    it('should return correct component name', () => {
      const MOCK_COMPONENT = {
        constructor: {
          name: 'mock-component',
        },
      };
      const name = highlighter.getDirectiveName(MOCK_COMPONENT);
      expect(name).toBe(MOCK_COMPONENT.constructor.name);
    });
  });
  describe('inDoc', () => {
    it('should return false if no node is provided', () => {
      expect(highlighter.inDoc(undefined)).toBeFalsy();
    });
    it('should be true if doc and node are equal', () => {
      const node = {
        parentNode: {},
        ownerDocument: {
          documentElement: {},
        },
      };
      node.ownerDocument.documentElement = node;
      expect(highlighter.inDoc(node)).toBeTruthy();
    });
    it('should be true if doc and parent are equal', () => {
      const node = {
        parentNode: 'node',
        ownerDocument: {
          documentElement: 'node',
        },
      };
      expect(highlighter.inDoc(node)).toBeTruthy();
    });
    it('should be true if doc contains parent', () => {
      const node = {
        parentNode: {
          nodeType: 1,
        },
        ownerDocument: {
          documentElement: {
            contains: () => true,
          },
        },
      };
      expect(highlighter.inDoc(node)).toBeTruthy();
    });
  });
  // Those test were disabled since very flaky on the CI - needs investigation before re-enabling
  xdescribe('highlightHydrationElement', () => {
    afterEach(() => {
      document.body.innerHTML = '';
      delete window.ng;
    });
    it('should show hydration overlay with svg', () => {
      const appNode = document.createElement('app');
      appNode.style.width = '500px';
      appNode.style.height = '400px';
      appNode.style.display = 'block';
      document.body.appendChild(appNode);
      window.ng = {
        getComponent: (el) => el,
      };
      highlighter.highlightHydrationElement(appNode, {status: 'hydrated'});
      expect(document.body.querySelectorAll('div').length).toBe(2);
      expect(document.body.querySelectorAll('svg').length).toBe(1);
      const overlay = document.body.querySelector('.ng-devtools-overlay');
      expect(overlay?.getBoundingClientRect().width).toBe(500);
      expect(overlay?.getBoundingClientRect().height).toBe(400);
      highlighter.removeHydrationHighlights();
      expect(document.body.querySelectorAll('div').length).toBe(0);
      expect(document.body.querySelectorAll('svg').length).toBe(0);
    });
    it('should show hydration overlay without svg (too small)', () => {
      const appNode = document.createElement('app');
      appNode.style.width = '25px';
      appNode.style.height = '20px';
      appNode.style.display = 'block';
      document.body.appendChild(appNode);
      window.ng = {
        getComponent: (el) => el,
      };
      highlighter.highlightHydrationElement(appNode, {status: 'hydrated'});
      expect(document.body.querySelectorAll('div').length).toBe(1);
      expect(document.body.querySelectorAll('svg').length).toBe(0);
      const overlay = document.body.querySelector('.ng-devtools-overlay');
      expect(overlay?.getBoundingClientRect().width).toBe(25);
      expect(overlay?.getBoundingClientRect().height).toBe(20);
      highlighter.removeHydrationHighlights();
      expect(document.body.querySelectorAll('div').length).toBe(0);
      expect(document.body.querySelectorAll('svg').length).toBe(0);
    });
    it('should show hydration overlay and selected component overlay at the same time ', () => {
      const appNode = document.createElement('app');
      appNode.style.width = '25px';
      appNode.style.height = '20px';
      appNode.style.display = 'block';
      document.body.appendChild(appNode);
      window.ng = {
        getComponent: (el) => el,
      };
      highlighter.highlightHydrationElement(appNode, {status: 'hydrated'});
      highlighter.highlightSelectedElement(appNode);
      expect(document.body.querySelectorAll('.ng-devtools-overlay').length).toBe(2);
      highlighter.removeHydrationHighlights();
      expect(document.body.querySelectorAll('.ng-devtools-overlay').length).toBe(1);
      highlighter.unHighlight();
      expect(document.body.querySelectorAll('.ng-devtools-overlay').length).toBe(0);
      highlighter.highlightHydrationElement(appNode, {status: 'hydrated'});
      highlighter.highlightSelectedElement(appNode);
      highlighter.unHighlight();
      expect(document.body.querySelectorAll('.ng-devtools-overlay').length).toBe(1);
      highlighter.removeHydrationHighlights();
      expect(document.body.querySelectorAll('.ng-devtools-overlay').length).toBe(0);
    });
  });
  describe('highlightSelectedElement', () => {
    function createElement(name) {
      const element = document.createElement(name);
      element.style.width = '25px';
      element.style.height = '20px';
      element.style.display = 'block';
      document.body.appendChild(element);
      return element;
    }
    it('should show overlay', () => {
      const appNode = createElement('app');
      window.ng = {
        getComponent: (el) => new (class FakeComponent {})(),
      };
      highlighter.highlightSelectedElement(appNode);
      const overlay = document.body.querySelectorAll('.ng-devtools-overlay');
      expect(overlay.length).toBe(1);
      expect(overlay[0].innerHTML).toContain('FakeComponent');
      highlighter.unHighlight();
      expect(document.body.querySelectorAll('.ng-devtools-overlay').length).toBe(0);
    });
    it('should remove the previous overlay when calling highlightSelectedElement again', () => {
      const appNode = createElement('app');
      const appNode2 = createElement('app-two');
      window.ng = {
        getComponent: (el) => new (class FakeComponent {})(),
      };
      highlighter.highlightSelectedElement(appNode);
      highlighter.highlightSelectedElement(appNode2);
      const overlay = document.body.querySelectorAll('.ng-devtools-overlay');
      expect(overlay.length).toBe(1);
    });
  });
});
//# sourceMappingURL=highlighter.spec.js.map
