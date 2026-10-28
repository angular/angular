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
import {RectWithScroll, ViewportData} from './utils';

const VIEWPORT: ViewportData = {width: 640, height: 480, scrollX: 0, scrollY: 0};
const VISIBLE_RECT: RectWithScroll = {
  x: 100,
  y: 50,
  width: 200,
  height: 80,
  scrollX: 0,
  scrollY: 0,
};

// The `IntersectionObserver` sets a `null` rect when
// the target is outside of the viewport.
const OFFSCREEN_RECT = null;

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
    function createOp(rect: RectWithScroll | null) {
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

      expect(op.isVisible()).toBeFalse();
      expect(fillRect).not.toHaveBeenCalled();
      expect(op.state).toBe('standby');
    });

    it('should draw at the updated rect', () => {
      const op = createOp(OFFSCREEN_RECT);

      op.update({rect: VISIBLE_RECT});
      op.render(0);

      expect(op.isVisible()).toBeTrue();
      expect(fillRect).toHaveBeenCalled();
    });

    it('should draw relative to the scroll position of the updated viewport', () => {
      const op = createOp(VISIBLE_RECT);

      op.update({viewport: {...VIEWPORT, scrollX: 30, scrollY: 20}});
      op.render(0);

      // The first `fillRect` call is the overlay.
      expect(fillRect.calls.first().args).toEqual([
        VISIBLE_RECT.x - 30,
        VISIBLE_RECT.y - 20,
        VISIBLE_RECT.width,
        VISIBLE_RECT.height,
      ]);
    });

    it('should hide the highlight when the rect is cleared', () => {
      const op = createOp(VISIBLE_RECT);

      op.update({rect: null});
      op.render(0);

      expect(op.isVisible()).toBeFalse();
      expect(fillRect).not.toHaveBeenCalled();
    });
  });

  describe('DynamicTtlBoundHighlightRenderOp', () => {
    function createOp(rect: RectWithScroll | null) {
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

    it('should hide the highlight when the rect is cleared', () => {
      const op = createOp(VISIBLE_RECT);

      op.update({rect: null});
      op.render(0);

      expect(op.isVisible()).toBeFalse();
      expect(fillRect).not.toHaveBeenCalled();
    });
  });
});
