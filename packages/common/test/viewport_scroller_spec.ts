/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {BrowserViewportScroller, ViewportScroller} from '../src/viewport_scroller';

describe('BrowserViewportScroller', () => {
  let scroller: ViewportScroller;
  let documentSpy: any;
  let windowSpy: any;

  beforeEach(() => {
    windowSpy = jasmine.createSpyObj('window', ['history']);
    windowSpy.scrollTo = 1;
    windowSpy.history.scrollRestoration = 'auto';
    documentSpy = jasmine.createSpyObj('document', ['getElementById', 'getElementsByName']);
    scroller = new BrowserViewportScroller(documentSpy, windowSpy, null!);
  });

  describe('setHistoryScrollRestoration', () => {
    it('should not crash when scrollRestoration is not writable', () => {
      Object.defineProperty(windowSpy.history, 'scrollRestoration', {
        value: 'auto',
        configurable: true,
      });
      expect(() => scroller.setHistoryScrollRestoration('manual')).not.toThrow();
    });
  });

  describe('scrollToAnchor', () => {
    const anchor = 'anchor';
    const el = document.createElement('a');

    it('should only call getElementById when an element is found by id', () => {
      documentSpy.getElementById.and.returnValue(el);
      spyOn<any>(scroller, 'scrollToElement');
      scroller.scrollToAnchor(anchor);
      expect(documentSpy.getElementById).toHaveBeenCalledWith(anchor);
      expect(documentSpy.getElementsByName).not.toHaveBeenCalled();
      expect((scroller as any).scrollToElement).toHaveBeenCalledWith(el);
    });

    it('should call getElementById and getElementsByName when an element is found by name', () => {
      documentSpy.getElementsByName.and.returnValue([el]);
      spyOn<any>(scroller, 'scrollToElement');
      scroller.scrollToAnchor(anchor);
      expect(documentSpy.getElementById).toHaveBeenCalledWith(anchor);
      expect(documentSpy.getElementsByName).toHaveBeenCalledWith(anchor);
      expect((scroller as any).scrollToElement).toHaveBeenCalledWith(el);
    });

    it('should not call scrollToElement when an element is not found by its id or its name', () => {
      documentSpy.getElementsByName.and.returnValue([]);
      spyOn<any>(scroller, 'scrollToElement');
      scroller.scrollToAnchor(anchor);
      expect(documentSpy.getElementById).toHaveBeenCalledWith(anchor);
      expect(documentSpy.getElementsByName).toHaveBeenCalledWith(anchor);
      expect((scroller as any).scrollToElement).not.toHaveBeenCalled();
    });
  });
});
