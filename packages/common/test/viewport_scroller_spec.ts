/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BrowserViewportScroller, ViewportScroller} from '../src/viewport_scroller';
import {isNode} from '@angular/private/testing';

describe('BrowserViewportScroller', () => {
  describe('setHistoryScrollRestoration', () => {
    let scroller: ViewportScroller;
    let windowSpy: any;

    beforeEach(() => {
      windowSpy = jasmine.createSpyObj('window', [
        'history',
        'scrollTo',
        'pageXOffset',
        'pageYOffset',
      ]);
      windowSpy.history.scrollRestoration = 'auto';
      scroller = new BrowserViewportScroller(document, windowSpy);
    });

    function createNonWritableScrollRestoration() {
      Object.defineProperty(windowSpy.history, 'scrollRestoration', {
        value: 'auto',
        configurable: true,
      });
    }

    it('should not crash when scrollRestoration is not writable', () => {
      createNonWritableScrollRestoration();
      expect(() => scroller.setHistoryScrollRestoration('manual')).not.toThrow();
    });

    it('should not allow overwriting position with options', () => {
      scroller.scrollToPosition([10, 10], {top: 0, left: 0} as any);
      expect(windowSpy.scrollTo).toHaveBeenCalledWith({top: 10, left: 10});
    });

    it('should still allow scrolling if scrollRestoration is not writable', () => {
      createNonWritableScrollRestoration();
      scroller.scrollToPosition([10, 10]);
      expect(windowSpy.scrollTo).toHaveBeenCalledWith({top: 10, left: 10});
    });
  });

  describe('scrollToAnchor', () => {
    // Testing scroll behavior does not make sense outside a browser
    if (isNode) {
      // Jasmine will throw if there are no tests.
      it('should pass', () => {});
      return;
    }

    const anchor = 'anchor';
    let scroller: BrowserViewportScroller;

    beforeEach(() => {
      scroller = new BrowserViewportScroller(document, window);
      scroller.scrollToPosition([0, 0]);
    });

    it('should scroll when element with matching id is found', () => {
      const {anchorNode, cleanup} = createTallElement();
      anchorNode.id = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should scroll when anchor with matching name is found', () => {
      const {anchorNode, cleanup} = createTallElement();
      anchorNode.name = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should not scroll when no matching element is found', () => {
      const {cleanup} = createTallElement();
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).toEqual(0);
      cleanup();
    });

    it('should scroll when element with matching id is found inside the shadow DOM', () => {
      const {anchorNode, cleanup} = createTallElementWithShadowRoot();
      anchorNode.id = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should scroll when anchor with matching name is found inside the shadow DOM', () => {
      const {anchorNode, cleanup} = createTallElementWithShadowRoot();
      anchorNode.name = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should not allow overwriting position with options', () => {
      const {anchorNode, cleanup} = createTallElementWithShadowRoot();
      anchorNode.name = anchor;
      scroller.scrollToAnchor(anchor, {top: 0, left: 0} as any);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    function createTallElement() {
      const tallItem = document.createElement('div');
      tallItem.style.height = '3000px';
      document.body.appendChild(tallItem);
      const anchorNode = createAnchorNode();
      document.body.appendChild(anchorNode);

      return {
        anchorNode,
        cleanup: () => {
          tallItem.remove();
          anchorNode.remove();
        },
      };
    }

    function createTallElementWithShadowRoot() {
      const tallItem = document.createElement('div');
      tallItem.style.height = '3000px';
      document.body.appendChild(tallItem);

      const elementWithShadowRoot = document.createElement('div');
      const shadowRoot = elementWithShadowRoot.attachShadow({mode: 'open'});
      const anchorNode = createAnchorNode();
      shadowRoot.appendChild(anchorNode);
      document.body.appendChild(elementWithShadowRoot);

      return {
        anchorNode,
        cleanup: () => {
          tallItem.remove();
          elementWithShadowRoot.remove();
        },
      };
    }

    function createAnchorNode() {
      const anchorNode = document.createElement('a');
      anchorNode.innerText = 'some link';
      anchorNode.href = '#';
      return anchorNode;
    }
  });
});
