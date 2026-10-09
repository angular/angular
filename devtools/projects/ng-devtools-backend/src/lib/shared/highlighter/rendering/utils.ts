/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AngularDevtoolsError} from '../../utils/error';
import {
  HighlightLabel,
  HighlightLabelDefinition,
  HighlightLabelProps,
  HighlightTemplate,
  RgbColor,
} from '../types';

export interface Coor {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ViewportData extends Dimensions {
  scrollX: number;
  scrollY: number;
}

export type Rect = Coor & Dimensions;

const LABEL_PADDING = 2;
const SVG_SIZE = 12;
const SVG_VIEWBOX = 24;
const SVG_LABEL_DIMENSIONS: Dimensions = {
  width: SVG_SIZE + LABEL_PADDING * 2,
  height: SVG_SIZE + LABEL_PADDING * 2,
};

export function createCanvas(canvasId: string): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  let canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.style.position = 'absolute';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '2147483647';
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new AngularDevtoolsError('Unable to get highlighter canvas rendering context.');
  }

  return {
    canvas,
    ctx,
  };
}

export function getViewportData(): ViewportData {
  return {
    width: ~~document.documentElement.clientWidth,
    height: ~~document.documentElement.clientHeight,
    scrollX: ~~window.scrollX,
    scrollY: ~~window.scrollY,
  };
}

export function toCSSColor([red, green, blue]: RgbColor, alpha = 1): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/** Returns a `Rect` based on `getBoundingClientRect` + the scroll positions. */
export function getAbsoluteBoundingClientRect(target: Element): Rect {
  const {width, height, x, y} = target.getBoundingClientRect();

  return {
    width: ~~width,
    height: ~~height,
    x: ~~(x + window.scrollX),
    y: ~~(y + window.scrollY),
  };
}

export function setCanvasOpacity(ctx: CanvasRenderingContext2D, opacity: number) {
  ctx.globalAlpha = opacity;
}

/**
 * Draw a highlight overlay.
 * @param ctx 2D context of the canvas
 * @param template Highlight template
 * @param rect The bounding rect of the target element
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  template: HighlightTemplate,
  {x, y, width, height}: Rect,
) {
  switch (template.style) {
    default:
    case 'fill':
      {
        ctx.fillStyle = toCSSColor(template.overlayColor, 0.35);
        ctx.fillRect(x, y, width, height);
      }
      break;
    case 'outline':
      {
        // Outer border
        const outerStroke = 3;
        ctx.lineWidth = outerStroke;
        ctx.strokeStyle = toCSSColor(template.overlayColor, 0.5);
        ctx.strokeRect(x, y, width, height);

        // Inner border
        // We use it instead of a shadow as a less
        // computationally-extensive alternative.
        const pad = outerStroke / 2;
        ctx.lineWidth = 4;
        ctx.strokeStyle = toCSSColor(template.overlayColor, 0.2);
        ctx.strokeRect(x + pad, y + pad, width - outerStroke, height - outerStroke);
      }
      break;
  }
}

/**
 * Draw highlight labels.
 * @param ctx 2D context of the canvas
 * @param template Highlight template
 * @param props Current highlight instance props
 * @param rect The bounding rect of the target element
 * @param viewport Viewport data
 */
export function drawLabels(
  ctx: CanvasRenderingContext2D,
  template: HighlightTemplate,
  props: HighlightLabelProps<HighlightLabelDefinition>,
  rect: Rect,
  viewport: ViewportData,
) {
  const bgColor = toCSSColor(template.overlayColor, 0.9);
  ctx.font = '11px monospace';

  for (const [name, labelDefinition] of Object.entries(template.labels)) {
    const content = labelDefinition.content(...(props[name] ? props[name] : []));

    if (typeof content === 'string') {
      const labelBoxDim = getTextLabelDimensions(ctx, content);
      const labelPos = calculateLabelPos(
        rect,
        viewport,
        labelBoxDim.size,
        template.labelsType,
        labelDefinition,
      );
      if (!labelPos) {
        continue;
      }

      drawTextLabel(
        ctx,
        content,
        bgColor,
        Object.assign(labelPos, labelBoxDim.size),
        labelBoxDim.fontBoundingBoxAscent,
      );
    } else {
      const labelPos = calculateLabelPos(
        rect,
        viewport,
        SVG_LABEL_DIMENSIONS,
        template.labelsType,
        labelDefinition,
      );
      if (!labelPos) {
        continue;
      }

      drawSvgLabel(ctx, content, bgColor, Object.assign(labelPos, SVG_LABEL_DIMENSIONS));
    }
  }
}

/**
 * Returns the width and height (including `fontBoundingBoxAscent`) of the provided text.
 */
function getTextLabelDimensions(
  ctx: CanvasRenderingContext2D,
  text: string,
): {size: Dimensions; fontBoundingBoxAscent: number} {
  const m = ctx.measureText(text);
  const w = m.width;
  const h = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
  const size = {width: w + LABEL_PADDING * 2, height: h + LABEL_PADDING * 2};

  return {size, fontBoundingBoxAscent: m.fontBoundingBoxAscent};
}

function drawTextLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  bgColor: string,
  {x, y, width, height}: Rect,
  fontBoundingBoxAscent: number,
) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = toCSSColor([255, 255, 255]);
  ctx.fillText(text, x + LABEL_PADDING, y + LABEL_PADDING + fontBoundingBoxAscent);
}

function drawSvgLabel(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  bgColor: string,
  {x, y, width, height}: Rect,
) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  ctx.save();
  ctx.translate(x + LABEL_PADDING, y + LABEL_PADDING);
  ctx.scale(SVG_SIZE / SVG_VIEWBOX, SVG_SIZE / SVG_VIEWBOX);
  ctx.fillStyle = toCSSColor([255, 255, 255]);
  ctx.fill(path);
  ctx.restore();
}

function calculateLabelPos(
  rect: Rect,
  viewport: ViewportData,
  labelSize: Dimensions,
  labelType: HighlightTemplate['labelsType'],
  {offset: labelOffset, x: labelX}: HighlightLabel<any>,
): Coor | null {
  let x = 0;
  let y = 0;

  let insetFallback = false;
  const isInset = labelOffset === 'inset';
  const isStrictInset = labelOffset === 'strict-inset';

  // If the label type is set to `sticky`, we determine the max X and Y
  // based on the viewport and current scroll. This way, the labels are kept
  // always visible.
  let maxX = Infinity;
  let maxY = Infinity;

  if (labelType === 'sticky') {
    maxX = viewport.width + viewport.scrollX - labelSize.width;
    maxY = viewport.height + viewport.scrollY - labelSize.height;
  }

  if (isInset || isStrictInset) {
    const isRectTooSmall = labelSize.width > rect.width || labelSize.height > rect.height;

    if (isRectTooSmall) {
      if (isInset) {
        // If there isn't enough space for the label to be
        // rendered inside the overlay, we render it outside,
        // so we are falling back to `outset` mode.
        insetFallback = true;
      } else {
        // If we have a `strict-inset` mode, we just skip
        // the rendering of that label.
        return null;
      }
    }

    const originY = rect.y + rect.height - labelSize.height;
    y = isInset ? Math.min(originY, maxY) : originY;
  }
  if (labelOffset === 'outset' || insetFallback) {
    y = Math.min(rect.y + rect.height, maxY);
  }

  switch (labelX) {
    case 'left':
      x = Math.min(rect.x, maxX);
      break;
    case 'center':
      x = Math.min(rect.x + (rect.width / 2 - labelSize.width / 2), maxX);
      break;
    case 'right':
      x = Math.min(rect.x + rect.width - labelSize.width, maxX);
  }

  return {x, y};
}
