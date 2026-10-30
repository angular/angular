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
import {getRenderer} from './rendering/renderer';
import {hydrationCompletedHighlightTemplate, inspectElementHighlightTemplate} from './templates';
import {Highlight, HighlightType} from './types';

function inspect(el: Element, name = 'TestComponent'): Highlight | null {
  return highlightElement(el, inspectElementHighlightTemplate, {'component-name': [name]});
}

function hydrate(el: Element): Highlight | null {
  return highlightElement(el, hydrationCompletedHighlightTemplate, {'icon': ['hydrated']});
}

describe('Highlighter', () => {
  let renderHighlight: jasmine.Spy;
  let removeHighlight: jasmine.Spy;
  let getComponentSpy: jasmine.Spy;

  beforeEach(() => {
    const renderer = getRenderer();
    renderHighlight = spyOn(renderer, 'renderHighlight');
    removeHighlight = spyOn(renderer, 'removeHighlight');

    getComponentSpy = jasmine.createSpy('getComponent').and.returnValue({});
    (window as any).ng = {getComponent: getComponentSpy};
  });

  afterEach(() => {
    removeAllHighlights();
    delete (window as any).ng;
  });

  describe('highlightElement', () => {
    it('should return null when no Angular directive is found', () => {
      getComponentSpy.and.returnValue(null);

      expect(inspect(document.createElement('div'))).toBeNull();
      expect(renderHighlight).not.toHaveBeenCalled();
    });

    it('should create a highlight', () => {
      const highlight = inspect(document.createElement('div'))!;

      expect(highlight.type).toBe(HighlightType.InspectElement);
      expect(highlight.props).toEqual({'component-name': ['TestComponent']});
      expect(highlight.isDisplayed).toBeTrue();
      expect(renderHighlight).toHaveBeenCalledOnceWith(highlight);
    });

    it('should highlight an SVG element', () => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      expect(inspect(el, 'Svg')?.isDisplayed).toBeTrue();
    });
  });

  describe('removeElementHighlights', () => {
    it('should not throw an error when the element has no highlights', () => {
      expect(() => removeElementHighlights(document.createElement('div'))).not.toThrow();
    });

    it('should destroy all highlights of the provided element', () => {
      const elFoo = document.createElement('div');
      const foo = inspect(elFoo)!;
      const fooHydration = hydrate(elFoo)!;

      // Adding a second element that should keep it's highlights.
      const elBar = document.createElement('div');
      const bar = inspect(elBar)!;

      removeElementHighlights(elFoo);

      expect(foo.isDestroyed).toBeTrue();
      expect(fooHydration.isDestroyed).toBeTrue();

      // bar's elements should remain visible.
      expect(bar.isDestroyed).toBeFalse();
      expect(bar.isDisplayed).toBeTrue();
    });
  });

  describe('removeAllHighlights', () => {
    it(`should not throw an error when there aren't any highlights`, () => {
      expect(() => removeAllHighlights()).not.toThrow();
    });

    it('should remove all highlights', () => {
      const foo = inspect(document.createElement('div'))!;
      const bar = hydrate(document.createElement('div'))!;

      removeAllHighlights();

      expect(foo.isDestroyed).toBeTrue();
      expect(bar.isDestroyed).toBeTrue();
      expect(removeHighlight).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeHighlightsByType', () => {
    it('should remove the highlights of the provided type only', () => {
      const foo = inspect(document.createElement('div'))!;
      const bar = hydrate(document.createElement('div'))!;

      removeHighlightsByType(HighlightType.HydrationCompleted);

      expect(bar.isDestroyed).toBeTrue();
      expect(foo.isDestroyed).toBeFalse();
    });
  });

  describe('Priority system', () => {
    it('should display the highest priority highlight', () => {
      const el = document.createElement('div');
      const hydration = hydrate(el)!;
      const inspection = inspect(el)!; // Inspect has a higher priority

      expect(inspection.isDisplayed).toBeTrue();
      expect(hydration.isDisplayed).toBeFalse(); // Hydration highlight is hidden
    });

    it('should promote the next highest priority highlight when the top one is destroyed', () => {
      const el = document.createElement('div');
      const inspection = inspect(el)!;
      const hydration = hydrate(el)!;

      inspection.destroy();

      expect(hydration.isDisplayed).toBeTrue();
    });
  });
});
