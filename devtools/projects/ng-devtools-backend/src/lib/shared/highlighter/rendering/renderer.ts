/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runOutsideAngular} from '../../utils/general';
import {Highlight} from '../types';
import {DynamicTtlBoundHighlightRenderOp, RenderOp, StaticHighlightRenderOp} from './operations';
import {
  createCanvas,
  createRectWithScroll,
  getViewportData,
  RectWithScroll,
  ViewportData,
} from './utils';

export const CANVAS_ID = 'ng-devtools-highlighter-canvas';

/**
 * Provides HTML5 Canvas rendering medium for highlights.
 */
export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  // NOTE: The highlighting mechanism is carefully handling
  // `Highlight` instances. The `Renderer` doesn't use weak-references,
  // so it's a important to ensure that each highlight goes through
  // the standard "render -> remove/hide" cycle when you are a consumer
  // of the `Renderer`.
  private readonly operations = new Map<Highlight, RenderOp>();
  private readonly targets = new WeakMap<Element, Set<Highlight>>();
  private viewportData: ViewportData = getViewportData();
  private elementResizeObserver!: ResizeObserver;
  private elementIntersectionObserver!: IntersectionObserver;
  private cleanUpFn?: () => void;
  private lastFrame?: ReturnType<typeof requestAnimationFrame>;

  constructor() {
    const {canvas, ctx} = createCanvas(CANVAS_ID);
    this.canvas = canvas;
    this.ctx = ctx;

    document.body.appendChild(this.canvas);
    this.updateCanvasSize();
    this.cleanUpFn = this.initEvents();
  }

  private get dpr() {
    return window.devicePixelRatio ?? 1;
  }

  renderHighlight(highlight: Highlight) {
    const targetEl = highlight.targetElement.deref();
    if (!targetEl) {
      this.removeHighlight(highlight);
      return;
    }

    let currentRect: RectWithScroll | null = null;

    // Since an element might have multiple highlights,
    // we keep track of them to know when to observe or
    // unobserve from our Observers.
    let highlights = this.targets.get(targetEl);
    if (!highlights) {
      highlights = new Set();
      this.targets.set(targetEl, highlights);

      // Attaching the object to the intersection observer
      // will determine whether the rect is withing the viewport
      // and will render the highlight, if true.
      this.elementIntersectionObserver.observe(targetEl);
      this.elementResizeObserver.observe(targetEl);
    } else {
      // If the target is already observed, we can
      // use one of the existing rects for the new op.
      const [arbitraryHighlight] = highlights;
      const arbitraryOp = this.operations.get(arbitraryHighlight);
      currentRect = arbitraryOp?.currentRect ?? null;
    }

    highlights.add(highlight);

    let op: RenderOp;

    if (!highlight.template.ttl) {
      op = new StaticHighlightRenderOp(highlight, this.ctx, currentRect, this.viewportData);
    } else {
      op = new DynamicTtlBoundHighlightRenderOp(
        highlight,
        this.ctx,
        currentRect,
        this.viewportData,
      );
    }

    this.operations.set(highlight, op);

    this.render();
  }

  removeHighlight(highlight: Highlight) {
    this.cleanHighlight(highlight);

    this.render();
  }

  destroy() {
    if (this.lastFrame) {
      cancelAnimationFrame(this.lastFrame);
    }
    this.cleanUpFn?.();
    this.canvas.remove();
  }

  /**
   * Initialize global events and observers that listen for
   * page updates (e.g. page size and scroll changes).
   * @returns A clean up function that unlistens all events.
   */
  private initEvents(): () => void {
    // Used for updating the viewport data and canvas size and scaling.
    const windowChangeHandler = (shouldUpdateCanvasSize: boolean) => {
      let windowChangeScheduled = false;
      return () => {
        if (windowChangeScheduled) {
          return;
        }
        windowChangeScheduled = true;

        requestAnimationFrame(() => {
          if (shouldUpdateCanvasSize) {
            this.updateCanvasSize();
          }
          this.viewportData = getViewportData();
          this.updateHighlightsViewportData();
          this.render();

          windowChangeScheduled = false;
        });
      };
    };

    const forEachTargetOp = <T extends {target: Element}>(
      entries: T[],
      cb: (entry: T, op: RenderOp) => void,
    ) => {
      for (const e of entries) {
        const highlights = this.targets.get(e.target);
        if (!highlights) {
          continue;
        }
        for (const h of highlights) {
          const op = this.operations.get(h);
          if (op) {
            cb(e, op);
          }
        }
      }
    };

    const windowScrollHandler = windowChangeHandler(false);
    const windowResizeHandler = windowChangeHandler(true);

    // Wrap Zone.js monkey-patched code for Zone-based apps.
    runOutsideAngular(() => {
      window.addEventListener('scroll', windowScrollHandler);
      window.addEventListener('resize', windowResizeHandler);

      // Detects when the target is inside the viewport and
      // provides the available `boundingRectClient`, therefore,
      // making the highlight visible until the target leaves
      // of the viewport (=> removing the rect => hiding it).
      this.elementIntersectionObserver = new IntersectionObserver((entries) => {
        forEachTargetOp(entries, (e, op) => {
          op.update({
            rect: e.isIntersecting ? createRectWithScroll(e.boundingClientRect) : null,
          });
        });

        this.render();
      });

      // Triggered when a target resizes. All affected
      // targets get their rect updates using standard
      // `getBoundingClientRect`.
      this.elementResizeObserver = new ResizeObserver((entries) => {
        forEachTargetOp(entries, (e, op) => {
          if (op.isVisible()) {
            op.update({rect: createRectWithScroll(e.target.getBoundingClientRect())});
          }
        });

        this.render();
      });
    });

    return () => {
      this.elementResizeObserver.disconnect();
      this.elementIntersectionObserver.disconnect();
      window.removeEventListener('scroll', windowScrollHandler);
      window.removeEventListener('resize', windowResizeHandler);
    };
  }

  /**
   * Update the viewport data of the render ops.
   */
  private updateHighlightsViewportData() {
    for (const highlight of this.operations.keys()) {
      const targetEl = highlight.targetElement.deref();

      if (targetEl) {
        const op = this.operations.get(highlight);
        op!.update({viewport: this.viewportData});
      }
    }
  }

  /**
   * Update and scale the canvas size based on
   * the root page element and the screen DPR.
   */
  private updateCanvasSize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;

    // Normalize the coordinate system to use CSS pixels
    this.ctx.scale(this.dpr, this.dpr);
  }

  private clearCanvas() {
    const {width, height} = this.canvas;
    this.ctx.clearRect(0, 0, width / this.dpr, height / this.dpr);
  }

  /** Clean all highlight-specific data from the renderer. */
  private cleanHighlight(highlight: Highlight) {
    const targetEl = highlight.targetElement.deref();
    if (targetEl) {
      const highlights = this.targets.get(targetEl);
      highlights?.delete(highlight);

      if (!highlights?.size) {
        this.targets.delete(targetEl);
        this.elementResizeObserver.unobserve(targetEl);
        this.elementIntersectionObserver.unobserve(targetEl);
      }
    }
    this.operations.delete(highlight);
  }

  /** Initiate rendering of all loaded `RenderOp`s. */
  private render() {
    if (this.lastFrame) {
      cancelAnimationFrame(this.lastFrame);
    }
    this.lastFrame = requestAnimationFrame((ts) => {
      this.renderFrame(ts);
    });
  }

  /** Render the next frame. */
  private renderFrame(timestamp: number) {
    this.clearCanvas();
    let inProgress = false;

    for (const op of this.operations.values()) {
      op.render(timestamp);
      inProgress ||= op.state === 'in-progress';

      // We are scheduling a clean up of the
      // operations that are completed.
      if (op.state === 'completed') {
        this.cleanHighlight(op.highlight);
        op.highlight.destroy();
      }
    }

    // Continue the render cycle until there are still ops in progress.
    if (inProgress) {
      if (this.lastFrame) {
        cancelAnimationFrame(this.lastFrame);
      }
      this.lastFrame = requestAnimationFrame((ts) => this.renderFrame(ts));
    }
  }
}

// Renderer instance.
let renderer: Renderer;

/** Get renderer instance. */
export function getRenderer() {
  if (!renderer) {
    renderer = new Renderer();
  }
  return renderer;
}
