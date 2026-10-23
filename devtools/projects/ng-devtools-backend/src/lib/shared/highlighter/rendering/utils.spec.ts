/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HighlightLabel, HighlightTemplate} from '../types';
import {createTemplate} from '../spec-utils';
import {
  createCanvas,
  drawLabels,
  drawOverlay,
  getAbsoluteBoundingClientRect,
  Rect,
  toCSSColor,
  ViewportData,
} from './utils';

describe('Rendering utils', () => {
  describe('toCSSColor', () => {
    it('should convert an RGB color to a CSS color', () => {
      expect(toCSSColor([1, 2, 3])).toBe('rgba(1, 2, 3, 1)');
      expect(toCSSColor([1, 2, 3], 0.5)).toBe('rgba(1, 2, 3, 0.5)');
    });
  });

  describe('createCanvas', () => {
    it('should create a canvas and a 2D context', () => {
      const {canvas, ctx} = createCanvas('test-canvas');

      expect(canvas.id).toBe('test-canvas');
      expect(canvas.style.pointerEvents).toBe('none');
      expect(ctx).toBeTruthy();
    });

    it('should reuse an already existing canvas', () => {
      const existing = document.createElement('canvas');
      existing.id = 'existing-test-canvas';
      document.body.appendChild(existing);

      expect(createCanvas('existing-test-canvas').canvas).toBe(existing);

      existing.remove();
    });
  });

  describe('getAbsoluteBoundingClientRect', () => {
    it('should truncate the rect values', () => {
      const el = document.createElement('div');
      spyOn(el, 'getBoundingClientRect').and.returnValue(new DOMRect(10.7, 20.3, 100.9, 50.6));

      expect(getAbsoluteBoundingClientRect(el)).toEqual({x: 10, y: 20, width: 100, height: 50});
    });

    it('should offset the rect by the page scroll position', () => {
      const spacer = document.createElement('div');
      spacer.style.height = '3000px';
      document.body.appendChild(spacer);
      window.scrollTo(0, 200);

      const el = document.createElement('div');
      spyOn(el, 'getBoundingClientRect').and.returnValue(new DOMRect(10, 20, 100, 50));

      expect(getAbsoluteBoundingClientRect(el)).toEqual({
        x: 10,
        y: 20 + window.scrollY,
        width: 100,
        height: 50,
      });
      expect(window.scrollY).toBe(200);

      window.scrollTo(0, 0);
      spacer.remove();
    });
  });

  describe('Drawing', () => {
    let ctx: CanvasRenderingContext2D;

    // Dimensions of a text label based on the mocked text metrics below
    const LABEL_WIDTH = 44; // 40 (text) + 2 * 2 (padding)
    const LABEL_HEIGHT = 14; // 8 (ascent) + 2 (descent) + 2 * 2 (padding)

    const LABEL = {name: ['Foo']};
    const VIEWPORT: ViewportData = {width: 640, height: 480, scrollX: 0, scrollY: 0};
    const RECT: Rect = {x: 50, y: 50, width: 200, height: 200};

    function createTemplWithLabel(
      label: Partial<HighlightLabel<any>> = {},
      overrides: Partial<HighlightTemplate<any>> = {},
    ): HighlightTemplate<any> {
      return createTemplate({
        labels: {
          name: {x: 'left', offset: 'outset', content: (name: string) => name, ...label},
        },
        ...overrides,
      });
    }

    beforeEach(() => {
      ctx = document.createElement('canvas').getContext('2d')!;
      spyOn(ctx, 'measureText').and.returnValue({
        width: 40,
        fontBoundingBoxAscent: 8,
        fontBoundingBoxDescent: 2,
      } as TextMetrics);
    });

    describe('drawOverlay', () => {
      it('should fill the target rect by default', () => {
        const fillRect = spyOn(ctx, 'fillRect');

        drawOverlay(ctx, createTemplate(), RECT);

        expect(fillRect).toHaveBeenCalledOnceWith(
          ...(Object.values(RECT) as [number, number, number, number]),
        );
      });
    });

    describe('drawLabels', () => {
      let fillRect: jasmine.Spy;

      beforeEach(() => {
        fillRect = spyOn(ctx, 'fillRect');
      });

      /** Returns the position and size of the label background box. */
      function labelBox(): number[] {
        return fillRect.calls.first().args as number[];
      }

      it('should draw an `outset` label below the target rect', () => {
        const template = createTemplWithLabel({offset: 'outset'});
        drawLabels(ctx, template, LABEL, RECT, VIEWPORT);

        expect(labelBox()).toEqual([RECT.x, RECT.y + RECT.height, LABEL_WIDTH, LABEL_HEIGHT]);
      });

      it('should draw an `inset` label within the target rect', () => {
        const template = createTemplWithLabel({offset: 'inset'});
        drawLabels(ctx, template, LABEL, RECT, VIEWPORT);

        expect(labelBox()).toEqual([
          RECT.x,
          RECT.y + RECT.height - LABEL_HEIGHT,
          LABEL_WIDTH,
          LABEL_HEIGHT,
        ]);
      });

      it('should fall back to `outset` when an `inset` label does not fit', () => {
        const template = createTemplWithLabel({offset: 'inset'});
        const rect: Rect = {x: 0, y: 0, width: 20, height: 10};

        drawLabels(ctx, template, LABEL, rect, VIEWPORT);

        expect(labelBox()).toEqual([rect.x, rect.y + rect.height, LABEL_WIDTH, LABEL_HEIGHT]);
      });

      it('should skip a `strict-inset` label that does not fit', () => {
        const template = createTemplWithLabel({offset: 'strict-inset'});
        const rect: Rect = {x: 0, y: 0, width: 20, height: 10};

        drawLabels(ctx, template, LABEL, rect, VIEWPORT);

        expect(fillRect).not.toHaveBeenCalled();
      });

      it('should center a label', () => {
        const template = createTemplWithLabel({x: 'center'});
        drawLabels(ctx, template, LABEL, RECT, VIEWPORT);

        expect(labelBox()[0]).toBe(RECT.x + RECT.width / 2 - LABEL_WIDTH / 2);
      });

      it('should align a label to the right', () => {
        const template = createTemplWithLabel({x: 'right'});
        drawLabels(ctx, template, LABEL, RECT, VIEWPORT);

        expect(labelBox()[0]).toBe(RECT.x + RECT.width - LABEL_WIDTH);
      });

      it('should keep `sticky` labels within the viewport', () => {
        const template = createTemplWithLabel({}, {labelsType: 'sticky'});
        const rect: Rect = {x: 1000, y: 1000, width: 200, height: 100};

        drawLabels(ctx, template, LABEL, rect, VIEWPORT);

        expect(labelBox()).toEqual([
          VIEWPORT.width - LABEL_WIDTH,
          VIEWPORT.height - LABEL_HEIGHT,
          LABEL_WIDTH,
          LABEL_HEIGHT,
        ]);
      });

      it('should NOT stick `static` labels to the viewport', () => {
        const rect: Rect = {x: 1000, y: 1000, width: 200, height: 100};

        drawLabels(ctx, createTemplWithLabel(), LABEL, rect, VIEWPORT);

        expect(labelBox()).toEqual([rect.x, rect.y + rect.height, LABEL_WIDTH, LABEL_HEIGHT]);
      });

      it('should draw a label with an SVG path content', () => {
        const path = new Path2D('M0 0 H24 V24 H0 Z');
        const fill = spyOn(ctx, 'fill');
        const svgLabelSize = 16; // 12 (icon) + 2 * 2 (padding)
        const template = createTemplWithLabel({content: () => path});

        drawLabels(ctx, template, {}, RECT, VIEWPORT);

        expect(labelBox()).toEqual([RECT.x, RECT.y + RECT.height, svgLabelSize, svgLabelSize]);
        expect(fill).toHaveBeenCalledOnceWith(path);
      });
    });
  });
});
