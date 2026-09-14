/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createMockHighlight, createTemplate} from '../spec-utils';
import {
  DynamicTtlBoundHighlightRenderOp,
  OVERLAY_FADE_OUT_DUR,
  StaticHighlightRenderOp,
} from './operations';
import {Rect, ViewportData} from './utils';

const VIEWPORT: ViewportData = {width: 640, height: 480, scrollX: 0, scrollY: 0};
const VISIBLE_RECT: Rect = {x: 100, y: 50, width: 200, height: 80};
const OFFSCREEN_RECT: Rect = {x: 1000, y: 1000, width: 200, height: 80};

const TTL = 1000;

describe('Highlighter render operations', () => {
  let ctx: CanvasRenderingContext2D;
  let fillRect: jasmine.Spy;

  beforeEach(() => {
    ctx = document.createElement('canvas').getContext('2d')!;
    // Using fillRect spy as some sort of a marker
    // whether the overlay has been rendered to the canvas.
    fillRect = spyOn(ctx, 'fillRect');
  });

  describe('StaticHighlightRenderOp', () => {
    function createOp(rect: Rect) {
      return new StaticHighlightRenderOp(createMockHighlight(), ctx, rect, VIEWPORT);
    }

    it('should draw the highlight and go on standby', () => {
      const op = createOp(VISIBLE_RECT);

      expect(op.state).toBe('non-executed');

      op.render(0);

      expect(fillRect).toHaveBeenCalled();
      expect(op.state).toBe('standby');
    });

    it('should NOT draw a highlight that is outside of the viewport', () => {
      const op = createOp(OFFSCREEN_RECT);

      op.render(0);

      expect(op.isVisible).toBeFalse();
      expect(fillRect).not.toHaveBeenCalled();
      expect(op.state).toBe('standby');
    });

    it('should draw at the updated rect', () => {
      const op = createOp(OFFSCREEN_RECT);

      op.update({rect: VISIBLE_RECT});
      op.render(0);

      expect(op.isVisible).toBeTrue();
      expect(fillRect).toHaveBeenCalled();
    });

    it('should become visible when the viewport is scrolled to the highlight', () => {
      const op = createOp(OFFSCREEN_RECT);

      expect(op.isVisible).toBeFalse();

      op.update({viewport: {...VIEWPORT, scrollX: 900, scrollY: 900}});

      expect(op.isVisible).toBeTrue();
    });
  });

  describe('DynamicTtlBoundHighlightRenderOp', () => {
    function createOp(rect: Rect) {
      const highlight = createMockHighlight(createTemplate({ttl: TTL}));
      return new DynamicTtlBoundHighlightRenderOp(highlight, ctx, rect, VIEWPORT);
    }

    it('should stay in progress and fully visible until the fade out starts', () => {
      const op = createOp(VISIBLE_RECT);

      op.render(0);

      expect(op.state).toBe('in-progress');
      expect(ctx.globalAlpha).toBe(1);

      const timeBeforeFadeOut = TTL - OVERLAY_FADE_OUT_DUR - 1;
      op.render(timeBeforeFadeOut);

      expect(op.state).toBe('in-progress');
      expect(ctx.globalAlpha).toBe(1);

      const timeMidFadeOut = timeBeforeFadeOut + 1 + OVERLAY_FADE_OUT_DUR / 2;
      op.render(timeMidFadeOut);

      expect(op.state).toBe('in-progress');
      expect(ctx.globalAlpha).toBe(0.5);

      op.render(TTL);

      expect(op.state).toBe('completed');
      expect(ctx.globalAlpha).toBe(0);
    });

    it('should complete even when the highlight is outside of the viewport', () => {
      const op = createOp(OFFSCREEN_RECT);

      op.render(0);
      op.render(TTL);

      expect(fillRect).not.toHaveBeenCalled();
      expect(op.state).toBe('completed');
    });
  });
});
