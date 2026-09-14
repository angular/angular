/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter} from '@angular/core';
import {debugLog} from '../utils/log';
import {HighlightImpl} from './highlight';
import {Renderer} from './rendering/renderer';
import {Highlight, HighlightTemplate, HighlightType} from './types';
import {createTemplate} from './spec-utils';

describe('HighlightImpl', () => {
  let renderer: jasmine.SpyObj<Renderer>;
  let destroyEvents: EventEmitter<[highlight: Highlight]>;
  let target: HTMLElement;

  function createHighlight(template: HighlightTemplate<any> = createTemplate()) {
    return new HighlightImpl(target, template, {title: ['Foo']}, destroyEvents, renderer);
  }

  beforeEach(() => {
    renderer = jasmine.createSpyObj<Renderer>('Renderer', ['renderHighlight', 'removeHighlight']);
    destroyEvents = new EventEmitter<[highlight: Highlight]>();
    target = document.createElement('div');
  });

  it('should throw an error when the template has duplicate X position labels', () => {
    const template = createTemplate({
      labels: {
        a: {x: 'left', offset: 'outset', content: () => 'a'},
        b: {x: 'left', offset: 'outset', content: () => 'b'},
      },
    });

    expect(() => createHighlight(template)).toThrowError(/multiple labels with 'left' X position/);
  });

  it('should expose the template data and a weak reference to the target', () => {
    const template = createTemplate({type: HighlightType.HydrationCompleted});
    const highlight = createHighlight(template);

    expect(highlight.type).toBe(HighlightType.HydrationCompleted);
    expect(highlight.template).toBe(template);
    expect(highlight.props).toEqual({title: ['Foo']});
    expect(highlight.targetElement.deref()).toBe(target);
    expect(highlight.isDisplayed).toBeFalse();
    expect(highlight.isDestroyed).toBeFalse();
  });

  describe('display', () => {
    it('should render the highlight', () => {
      const highlight = createHighlight();

      highlight.display();

      expect(renderer.renderHighlight).toHaveBeenCalledOnceWith(highlight);
      expect(highlight.isDisplayed).toBeTrue();
    });

    it('should NOT re-render an already displayed highlight', () => {
      const highlight = createHighlight();

      highlight.display();
      highlight.display();

      expect(renderer.renderHighlight).toHaveBeenCalledTimes(1);
    });

    it('should NOT render a destroyed highlight', () => {
      const highlight = createHighlight();
      spyOn(debugLog, 'warn');

      highlight.destroy();
      highlight.display();

      expect(renderer.renderHighlight).not.toHaveBeenCalled();
      expect(highlight.isDisplayed).toBeFalse();
      expect(debugLog.warn).toHaveBeenCalledWith('Cannot display a destroyed highlight.');
    });
  });

  describe('hide', () => {
    it('should remove the highlight', () => {
      const highlight = createHighlight();

      highlight.display();
      highlight.hide();

      expect(renderer.removeHighlight).toHaveBeenCalledOnceWith(highlight);
      expect(highlight.isDisplayed).toBeFalse();
    });
  });

  describe('updateLabel', () => {
    it('should update the label props and re-render', () => {
      const highlight = createHighlight();

      highlight.updateLabel('title', 'Bar');

      expect(highlight.props).toEqual({title: ['Bar']});
      expect(renderer.renderHighlight).toHaveBeenCalledOnceWith(highlight);
    });
  });

  describe('destroy', () => {
    it('should emit the destroy event and remove the highlight', () => {
      const emitted: Highlight[] = [];
      destroyEvents.subscribe(([h]) => emitted.push(h));
      const highlight = createHighlight();
      highlight.display();

      highlight.destroy();

      expect(emitted).toEqual([highlight]);
      expect(renderer.removeHighlight).toHaveBeenCalledOnceWith(highlight);
      expect(highlight.isDisplayed).toBeFalse();
      expect(highlight.isDestroyed).toBeTrue();
    });

    it('should warn and be a no-op on a double destroy', () => {
      let emitCount = 0;
      destroyEvents.subscribe(() => emitCount++);
      const highlight = createHighlight();
      spyOn(debugLog, 'warn');

      highlight.destroy();
      highlight.destroy();

      expect(emitCount).toBe(1);
      expect(renderer.removeHighlight).toHaveBeenCalledTimes(1);
      expect(debugLog.warn).toHaveBeenCalledOnceWith(
        'The highlight has already been destroyed. Check references storing.',
      );
    });
  });
});
