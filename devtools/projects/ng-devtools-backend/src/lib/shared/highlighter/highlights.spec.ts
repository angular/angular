/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter} from '@angular/core';
import {Highlight, HighlightLabelDefinition, HighlightTemplate, HighlightType} from './highlights';
import {OVERLAY_CLASS} from './dom';

function createTemplate(overrides?: Partial<HighlightTemplate<any>>): HighlightTemplate<any> {
  return {
    type: HighlightType.InspectElement,
    overlayColor: [0, 0, 0],
    labelsType: 'static',
    labels: {
      title: {
        x: 'left',
        offset: 'outset',
        content: (text: string) => `<${text}>`,
      },
    },
    ...overrides,
  };
}

function createHighlight<T extends HighlightLabelDefinition>(
  template: HighlightTemplate<T>,
  labelElements: Record<keyof T, HTMLElement>,
  destroyEvents = new EventEmitter<[highlight: Highlight]>(),
): Highlight<T> {
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;

  return new Highlight(overlay, labelElements, template, destroyEvents);
}

function getOverlay(): HTMLElement | null {
  return document.body.querySelector('.' + OVERLAY_CLASS);
}

describe('Highlight', () => {
  beforeEach(() => {
    const highlightOverlays = document.body.querySelectorAll('.' + OVERLAY_CLASS);
    for (const h of highlightOverlays) {
      h.remove();
    }
  });

  it('should throw an error when the template has duplicate X position labels', () => {
    const template: HighlightTemplate = {
      type: HighlightType.InspectElement,
      overlayColor: [0, 0, 0],
      labelsType: 'static',
      labels: {
        a: {x: 'left', offset: 'outset', content: () => 'a'},
        b: {x: 'left', offset: 'outset', content: () => 'b'},
      },
    };

    expect(() => {
      createHighlight(template, {
        a: document.createElement('div'),
        b: document.createElement('div'),
      });
    }).toThrowError(/multiple labels with 'left' X position/);
  });

  it('should return the template type', () => {
    const template = createTemplate({type: HighlightType.HydrationCompleted});
    const highlight = createHighlight(template, {title: document.createElement('div')});

    expect(highlight.type).toBe(HighlightType.HydrationCompleted);
  });

  describe('updateLabel', () => {
    it('should update the label when the content fn returns a string', () => {
      const labelElement = document.createElement('div');
      const highlight = createHighlight(createTemplate(), {title: labelElement});

      highlight.updateLabel('title', 'FooComponent');

      expect(labelElement.textContent).toBe('<FooComponent>');
    });

    it('should update the label when the content fn returns an Element', () => {
      const labelElement = document.createElement('div');
      const template = createTemplate({
        labels: {
          icon: {
            x: 'right',
            offset: 'inset',
            content: (className: string) => {
              const span = document.createElement('span');
              span.className = className ?? 'initial';
              return span;
            },
          },
        },
      });
      const highlight = createHighlight(template, {icon: labelElement});

      highlight.updateLabel('icon', 'updated');

      expect(labelElement.children.length).toBe(1);
      expect(labelElement.children[0].tagName).toBe('SPAN');
      expect(labelElement.children[0].className).toBe('updated');
    });
  });

  describe('display', () => {
    it('should append the overlay to document.body', () => {
      const highlight = createHighlight(createTemplate(), {
        title: document.createElement('div'),
      });

      highlight.display();

      expect(getOverlay()).not.toBeNull();
    });

    it('should NOT duplicate the overlay if already displayed', () => {
      const highlight = createHighlight(createTemplate(), {
        title: document.createElement('div'),
      });

      highlight.display();
      highlight.display();

      expect(document.body.querySelectorAll('.' + OVERLAY_CLASS).length).toBe(1);
    });
  });

  describe('hide', () => {
    it('should remove the overlay from document.body', () => {
      const highlight = createHighlight(createTemplate(), {
        title: document.createElement('div'),
      });
      highlight.display();
      highlight.hide();

      expect(getOverlay()).toBeNull();
    });
  });

  describe('position', () => {
    it('should position the overlay element using the given dimensions', () => {
      const highlight = createHighlight(createTemplate(), {
        title: document.createElement('div'),
      });
      const rect = new DOMRect(10, 20, 100, 50);

      highlight.position(rect);
      highlight.display();

      const overlay = getOverlay()!;

      expect(overlay.style.width).toBe('100px');
      expect(overlay.style.height).toBe('50px');
    });

    it('should hide inset label when the overlay is too small', () => {
      const labelElement = document.createElement('div');
      const template = createTemplate({
        labels: {
          title: {x: 'left', offset: 'inset', content: (text: string) => text},
        },
      });
      const highlight = createHighlight(template, {title: labelElement});

      highlight.position(new DOMRect(0, 0, 20, 20));

      expect(labelElement.style.display).toBe('none');
    });

    it('should show inset label when the overlay is large enough', () => {
      const labelElement = document.createElement('div');
      const template = createTemplate({
        labels: {
          title: {x: 'left', offset: 'inset', content: (text: string) => text},
        },
      });
      const highlight = createHighlight(template, {title: labelElement});

      highlight.position(new DOMRect(0, 0, 200, 200));

      expect(labelElement.style.display).toBe('');
    });
  });

  describe('destroy', () => {
    it('should emit the destroy event with the highlight instance', () => {
      const destroyEvents = new EventEmitter<[highlight: Highlight]>();
      const highlight = createHighlight(
        createTemplate(),
        {title: document.createElement('div')},
        destroyEvents,
      );
      const emitted: Highlight[] = [];
      destroyEvents.subscribe(([h]) => emitted.push(h));

      highlight.destroy();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toBe(highlight);
    });

    it('should remove the overlay element from the DOM', () => {
      const highlight = createHighlight(createTemplate(), {
        title: document.createElement('div'),
      });
      highlight.display();

      highlight.destroy();

      expect(document.body.querySelector('.' + OVERLAY_CLASS)).toBeNull();
    });

    it('should warn on double destroy', () => {
      const highlight = createHighlight(createTemplate(), {
        title: document.createElement('div'),
      });
      spyOn(console, 'warn');

      highlight.destroy();
      highlight.destroy();

      expect(console.warn).toHaveBeenCalledOnceWith(
        'The highlight has already been destroyed. Check references storing.',
      );
    });

    it('should NOT emit a second destroy event on double destroy', () => {
      const destroyEvents = new EventEmitter<[highlight: Highlight]>();
      const highlight = createHighlight(
        createTemplate(),
        {title: document.createElement('div')},
        destroyEvents,
      );
      let emitCount = 0;
      destroyEvents.subscribe(() => emitCount++);

      highlight.destroy();
      highlight.destroy();

      expect(emitCount).toBe(1);
    });
  });
});
