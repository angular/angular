/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  highlightElement,
  removeAllHighlights,
  removeElementHighlights,
  removeHighlightsByType,
} from '.';
import {OVERLAY_CLASS} from './dom';
import {
  Highlight,
  HighlightType,
  hydrationCompletedHighlightTemplate,
  inspectElementHighlightTemplate,
} from './highlights';

function getHighlightOverlays(): NodeListOf<Element> {
  return document.querySelectorAll('.' + OVERLAY_CLASS);
}

describe('highlighter', () => {
  let getComponentSpy: jasmine.Spy;
  let testElements: HTMLElement[] = [];

  function createTargetElement(width: number = 100, height: number = 50): HTMLElement {
    const el = document.createElement('div');

    el.style.position = 'absolute';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    document.body.appendChild(el);
    spyOn(el, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, width, height));

    testElements.push(el);

    return el;
  }

  beforeEach(() => {
    getComponentSpy = jasmine.createSpy('getComponent').and.returnValue({});
    (window as any).ng = {getComponent: getComponentSpy};
  });

  afterEach(() => {
    removeAllHighlights();
    for (const el of testElements) {
      el.remove();
    }
    testElements = [];

    for (const el of getHighlightOverlays()) {
      el.remove();
    }

    delete (window as any).ng;
  });

  describe('highlightElement', () => {
    it('should return null when no Angular component is found', () => {
      getComponentSpy.and.returnValue(null);
      const el = createTargetElement();

      const result = highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(result).toBeNull();
      expect(getHighlightOverlays().length).toBe(0);
    });

    it('should return null when the element is not in the document (`isInDoc`)', () => {
      const el = document.createElement('div');

      const result = highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(result).toBeNull();
    });

    it('should return null when the element has zero dimensions', () => {
      const el = createTargetElement(0, 0);

      const result = highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(result).toBeNull();
    });

    it('should return a `Highlight` on success', () => {
      const el = createTargetElement();

      const result = highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(result).toBeInstanceOf(Highlight);
    });

    it('should append an overlay element to document.body', () => {
      const el = createTargetElement();

      highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(getHighlightOverlays().length).toBe(1);
    });

    it('should create a label with the component name ("inspect element" template)', () => {
      const el = createTargetElement();

      highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['MyComponent'],
      });

      expect(getHighlightOverlays()[0].textContent).toContain('<MyComponent>');
    });
  });

  describe('removeElementHighlights', () => {
    it('should not throw an error when the element has no highlights', () => {
      const el = createTargetElement();

      expect(() => removeElementHighlights(el)).not.toThrow();
    });

    it('should remove the overlay from the DOM', () => {
      const el = createTargetElement();

      highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(getHighlightOverlays().length).toBe(1);

      removeElementHighlights(el);

      expect(getHighlightOverlays().length).toBe(0);
    });

    it('should not affect highlights on other elements', () => {
      const elFoo = createTargetElement();
      const elBar = createTargetElement();

      highlightElement(elFoo, inspectElementHighlightTemplate, {
        'component-name': ['FooComponent'],
      });
      highlightElement(elBar, inspectElementHighlightTemplate, {
        'component-name': ['BarComponent'],
      });

      expect(getHighlightOverlays().length).toBe(2);

      removeElementHighlights(elFoo);

      expect(getHighlightOverlays().length).toBe(1);
      expect(getHighlightOverlays()[0].textContent).toContain('<BarComponent>');
    });
  });

  describe('removeAllHighlights', () => {
    it(`should not throw an error when there aren't any highlights`, () => {
      expect(() => removeAllHighlights()).not.toThrow();
    });

    it('should remove all highlights from the DOM', () => {
      const elFoo = createTargetElement();
      const elBar = createTargetElement();

      highlightElement(elFoo, inspectElementHighlightTemplate, {
        'component-name': ['FooComponent'],
      });
      highlightElement(elBar, inspectElementHighlightTemplate, {
        'component-name': ['BarComponent'],
      });

      expect(getHighlightOverlays().length).toBe(2);

      removeAllHighlights();

      expect(getHighlightOverlays().length).toBe(0);
    });
  });

  describe('removeHighlightsByType', () => {
    it('should not remove highlights of non-matching types', () => {
      const elFoo = createTargetElement();
      const elBar = createTargetElement();

      highlightElement(elFoo, inspectElementHighlightTemplate, {
        'component-name': ['FooComponent'],
      });
      highlightElement(elBar, hydrationCompletedHighlightTemplate, {
        'icon': ['hydrated'],
      });

      removeHighlightsByType(HighlightType.HydrationCompleted);

      expect(getHighlightOverlays().length).toBe(1);
      expect(getHighlightOverlays()[0].textContent).toContain('<FooComponent>');
    });
  });

  describe('Priority system', () => {
    it('should display the highest priority highlight', () => {
      const el = createTargetElement();

      highlightElement(el, hydrationCompletedHighlightTemplate, {
        'icon': ['hydrated'],
      });
      highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      expect(getHighlightOverlays().length).toBe(1);
      expect(getHighlightOverlays()[0].textContent).toContain('<TestComponent>');
    });

    it('should hide lower-priority highlights', () => {
      const el = createTargetElement();

      highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });

      // The lower-priority highlight is added after the higher-priority one.
      highlightElement(el, hydrationCompletedHighlightTemplate, {
        'icon': ['hydrated'],
      });

      expect(getHighlightOverlays().length).toBe(1);
      expect(getHighlightOverlays()[0].textContent).toContain('<TestComponent>');
    });

    it('should promote the next highest priority highlight when the top one is destroyed', () => {
      const el = createTargetElement();

      const inspectHighlight = highlightElement(el, inspectElementHighlightTemplate, {
        'component-name': ['TestComponent'],
      });
      highlightElement(el, hydrationCompletedHighlightTemplate, {
        'icon': ['hydrated'],
      });

      expect(getHighlightOverlays().length).toBe(1);
      expect(getHighlightOverlays()[0].textContent).toContain('<TestComponent>');

      inspectHighlight!.destroy();

      expect(getHighlightOverlays().length).toBe(1);
      expect(getHighlightOverlays()[0].querySelector('svg')).not.toBeNull();
    });
  });
});
