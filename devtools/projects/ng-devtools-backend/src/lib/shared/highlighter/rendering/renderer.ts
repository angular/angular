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
import {createCanvas, getAbsoluteBoundingClientRect, getViewportData, ViewportData} from './utils';

export const CANVAS_ID = 'ng-devtools-highlighter-canvas';
const WINDOW_RESIZE_DEBOUNCE = 100;

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

    const rect = getAbsoluteBoundingClientRect(targetEl);
    let op: RenderOp;

    if (!highlight.template.ttl) {
      op = new StaticHighlightRenderOp(highlight, this.ctx, rect, this.viewportData);
    } else {
      op = new DynamicTtlBoundHighlightRenderOp(highlight, this.ctx, rect, this.viewportData);
    }

    this.operations.set(highlight, op);

    // Since an element might have multiple highlights,
    // we keep track of them to know when to observe or
    // unobserve from the `ResizeObserver`.
    let highlights = this.targets.get(targetEl);
    if (!highlights) {
      highlights = new Set();
      this.targets.set(targetEl, highlights);
      this.elementResizeObserver.observe(targetEl);
    }
    highlights.add(highlight);

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
    const root = document.documentElement;
    let rootResizeObserver: ResizeObserver;
    let rootMutationObserver: MutationObserver;
    let elementFrame: ReturnType<typeof requestAnimationFrame> = 0;
    let rootFrame: ReturnType<typeof requestAnimationFrame> = 0;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastSize: {width: number; height: number} = {
      width: 0,
      height: 0,
    };

    // We use this handler for all changes that
    // happen to the root element.
    const rootUpdatesHandler = () => {
      if (rootFrame) {
        cancelAnimationFrame(rootFrame);
      }
      rootFrame = requestAnimationFrame(() => {
        const width = root.scrollWidth;
        const height = root.scrollHeight;
        const {width: lastWidth, height: lastHeight} = lastSize;

        if (width !== lastWidth || height !== lastHeight) {
          this.updateCanvasSize();
          this.updateViewportData();
          this.updateHighlightsData('full');
          this.render();
        }

        lastSize = {width, height};
      });
    };

    // The scroll handler takes care of viewport data updates.
    const scrollHandler = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          this.updateViewportData();
          this.updateHighlightsData('viewport');
          this.render();
        });
      }, WINDOW_RESIZE_DEBOUNCE);
    };

    // Wrap Zone.js monkey-patched code for Zone-based apps.
    runOutsideAngular(() => {
      // NOTE: Along with the obvious `ResizeObserver`, we also
      // `observe` to a `MutationObserver`. It covers some specific
      // cases where absolutely-positioned content might change page
      // scroll area without affecting the size of the root element.
      rootResizeObserver = new ResizeObserver(rootUpdatesHandler);
      rootMutationObserver = new MutationObserver(rootUpdatesHandler);

      rootResizeObserver.observe(root);
      rootResizeObserver.observe(document.body);
      rootMutationObserver.observe(root, {childList: true, subtree: true, attributes: true});

      window.addEventListener('scroll', scrollHandler);

      this.elementResizeObserver = new ResizeObserver(() => {
        if (elementFrame) {
          return;
        }

        elementFrame = requestAnimationFrame(() => {
          elementFrame = 0;
          this.updateHighlightsData('full');
          this.render();
        });
      });
    });

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (rootFrame) {
        cancelAnimationFrame(rootFrame);
      }
      if (elementFrame) {
        cancelAnimationFrame(elementFrame);
      }
      rootResizeObserver.disconnect();
      rootMutationObserver.disconnect();
      this.elementResizeObserver.disconnect();
      window.removeEventListener('scroll', scrollHandler);
    };
  }

  /**
   * Update the highlights render ops.
   * @param config Use `full` for a full update (rect and viewport),
   * or `viewport` to update only the viewport data.
   */
  private updateHighlightsData(config: 'full' | 'viewport') {
    const fullData = config === 'full';

    for (const highlight of this.operations.keys()) {
      const targetEl = highlight.targetElement.deref();

      // Get the updated positions of all target elements.
      if (targetEl) {
        const rect = fullData ? getAbsoluteBoundingClientRect(targetEl) : undefined;
        const op = this.operations.get(highlight);
        op!.update({rect, viewport: this.viewportData});
      }
    }
  }

  private updateViewportData() {
    this.viewportData = getViewportData();
  }

  /**
   * Update and scale the canvas size based on
   * the root page element and the screen DPR.
   */
  private updateCanvasSize() {
    const width = document.documentElement.scrollWidth;
    const height = document.documentElement.scrollHeight;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;

    // Width is set by CSS (100%)
    this.canvas.style.height = `${height}px`;

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
