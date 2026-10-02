/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Highlight} from '../types';
import {drawLabels, drawOverlay, Rect, setCanvasOpacity, ViewportData} from './utils';

export const OVERLAY_FADE_OUT_DUR = 300;

/**
 * Render operation state.
 * - `non-executed` – the highlight hasn't been rendered.
 * - `in-progress` – the highlight is undergoing rendering;
 * usually used for dynamic highlights.
 * - `standby` – the highlight has been rendered;
 * usually used for when a static highlight rendering completes.
 * - `completed` - the rendering process has completed;
 * used to mark when a dynamic highlight rendering completes.
 */
type RenderOpState = 'non-executed' | 'in-progress' | 'standby' | 'completed';

interface RenderOpUpdate {
  rect?: Rect;
  viewport?: ViewportData;
}

/**
 * Render operation.
 * Describes the blueprint and the current rendering state of a highlight.
 * The operations are consumed by the `Renderer`.
 */
export abstract class RenderOp {
  /**
   * Render the highlight.
   * @param timestamp A timestamp usually provided by `requestAnimationFrame`.
   */
  abstract render(timestamp: number): void;

  protected stateInternal: RenderOpState = 'non-executed';

  /** Should mark the start timestamp of the rendering. */
  protected start: number = -1;

  constructor(
    public readonly highlight: Highlight,
    protected readonly ctx: CanvasRenderingContext2D,
    protected rect: Rect,
    protected viewport: ViewportData,
  ) {}

  get state() {
    return this.stateInternal;
  }

  /** Tells whether the highlight is visible in the viewport. */
  get isVisible() {
    const rect = this.rect;
    const viewport = this.viewport;

    const xAxis =
      viewport.scrollX - rect.width < rect.x && rect.x < viewport.width + viewport.scrollX;
    const yAxis =
      viewport.scrollY - rect.height < rect.y && rect.y < viewport.height + viewport.scrollY;

    return xAxis && yAxis;
  }

  protected get template() {
    return this.highlight.template;
  }

  protected get props() {
    return this.highlight.props;
  }

  /** Update the highlight rect and/or the viewport data. */
  update({rect, viewport}: RenderOpUpdate) {
    if (rect) {
      this.rect = rect;
    }
    if (viewport) {
      this.viewport = viewport;
    }
  }
}

/** Use for static highlights that don't have a TTL. */
export class StaticHighlightRenderOp extends RenderOp {
  override render(timestamp: number) {
    this.start = timestamp;

    if (this.isVisible) {
      setCanvasOpacity(this.ctx, 1);
      drawOverlay(this.ctx, this.template, this.rect);
      drawLabels(this.ctx, this.template, this.props, this.rect, this.viewport);
    }

    // Static highlights are directly marked as `standby`
    // as it is unknown to the `Renderer` when they will be hidden
    // (i.e. it/renderer requires an explicit instruction to hide it).
    this.stateInternal = 'standby';
  }
}

/** Use for TTL-based highlights ONLY. */
export class DynamicTtlBoundHighlightRenderOp extends RenderOp {
  private readonly fadeOutStart = this.template.ttl! - OVERLAY_FADE_OUT_DUR;

  override render(timestamp: number) {
    if (this.start === -1) {
      this.start = timestamp;
      this.stateInternal = 'in-progress';
    }

    const timePassed = timestamp - this.start;

    if (this.isVisible) {
      // Calculate the diff between the fade out start timestamp and the passed time.
      const fadeOutTimePassDiff = timePassed - this.fadeOutStart;
      let opacity: number;

      if (fadeOutTimePassDiff < 0) {
        opacity = 1;
      } else {
        const progress = Math.min(fadeOutTimePassDiff / OVERLAY_FADE_OUT_DUR, 1);
        // We have to invert the progress since we want to fade out, not fade in.
        opacity = 1 - progress;
      }

      setCanvasOpacity(this.ctx, opacity);
      drawOverlay(this.ctx, this.template, this.rect);
      drawLabels(this.ctx, this.template, this.props, this.rect, this.viewport);
    }

    if (timePassed >= this.template.ttl!) {
      this.stateInternal = 'completed';
    }
  }
}
