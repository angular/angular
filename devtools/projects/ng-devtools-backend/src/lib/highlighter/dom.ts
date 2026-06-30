/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  HighlightLabelProps,
  HighlightTemplate,
  HighlightLabelDefinition,
  HighlightLabel,
} from './highlights';

export const OVERLAY_CLASS = 'ng-devtools-highlight-overlay';
const OVERLAY_CONTENT_MARGIN = 4;
const MINIMAL_OVERLAY_CONTENT_SIZE = {
  width: 30 + OVERLAY_CONTENT_MARGIN * 2,
  height: 20 + OVERLAY_CONTENT_MARGIN * 2,
};
const X_TO_GRID_CELL: {[key in HighlightLabel<never>['x']]: string} = {
  'left': '1',
  'center': '2',
  'right': '3',
};
const X_TO_JUSTIFY_SELF: {[key in HighlightLabel<never>['x']]: string} = {
  'left': 'start',
  'center': 'center',
  'right': 'end',
};

export function createOverlayWithLabels<T extends HighlightLabelDefinition>(
  template: HighlightTemplate,
  props: HighlightLabelProps<T>,
): {
  overlay: HTMLElement;
  labels: Record<keyof T, HTMLElement>;
} {
  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;
  overlay.style.backgroundColor = toCSSColor(...template.overlayColor, 0.35);
  overlay.style.position = 'absolute';
  overlay.style.zIndex = '2147483647';
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'grid';
  overlay.style.alignItems = 'end';
  overlay.style.justifyContent = 'space-between';
  overlay.style.gridTemplateColumns = 'repeat(3, 1fr)';
  overlay.style.gap = '2px';

  if (template.labelsType === 'static') {
    overlay.style.boxSizing = 'border-box';
    overlay.style.padding = '2px';
  }

  const labels: Record<string, HTMLElement> = {};

  for (const [id, label] of Object.entries(template.labels)) {
    const labelElement = document.createElement('div');
    const labelStyle = labelElement.style;
    labelStyle.backgroundColor = toCSSColor(...template.overlayColor, 0.9);
    labelStyle.fontFamily = 'monospace';
    labelStyle.fontSize = '11px';
    labelStyle.padding = '2px 3px';
    labelStyle.borderRadius = '3px';
    labelStyle.color = 'white';
    labelStyle.gridRow = '1';
    labelStyle.gridColumn = X_TO_GRID_CELL[label.x];
    labelStyle.justifySelf = X_TO_JUSTIFY_SELF[label.x];

    if (label.offset === 'outset') {
      labelStyle.marginBottom = '-25px';
    }

    if (template.labelsType === 'sticky') {
      labelStyle.position = 'sticky';
      labelStyle.bottom = '0';
    }

    const content = label.content(...(props[id] ? props[id] : []));
    const contentElement = typeof content === 'string' ? document.createTextNode(content) : content;

    labelElement.appendChild(contentElement);

    overlay.appendChild(labelElement);
    labels[id] = labelElement;
  }

  return {overlay, labels: labels as Record<keyof T, HTMLElement>};
}

export function positionOverlayElement(dimensions: DOMRect, overlayElement: HTMLElement) {
  const {width, height, top, left} = dimensions;
  const style = overlayElement.style;

  style.width = ~~width + 'px';
  style.height = ~~height + 'px';
  style.top = ~~top + window.scrollY + 'px';
  style.left = ~~left + window.scrollX + 'px';
}

export function setLabelElementVisibility(
  dimensions: DOMRect,
  labelElement: HTMLElement,
  labelPosition: 'inset' | 'outset',
) {
  // We display a label inside the overlay if the container is large enough.
  if (
    labelPosition === 'inset' &&
    (dimensions.width <= MINIMAL_OVERLAY_CONTENT_SIZE.width ||
      dimensions.height <= MINIMAL_OVERLAY_CONTENT_SIZE.height)
  ) {
    labelElement.style.display = 'none';
  } else {
    labelElement.style.display = '';
  }
}

export function getComponentRect(el: Node): DOMRect | undefined {
  if (!(el instanceof HTMLElement)) {
    return;
  }
  if (!isInDoc(el)) {
    return;
  }
  return el.getBoundingClientRect();
}

function toCSSColor(red: number, green: number, blue: number, alpha = 1): string {
  return `rgba(${red},${green},${blue},${alpha})`;
}

function isInDoc(node: Node): boolean {
  if (!node || !node.ownerDocument) {
    return false;
  }
  const doc = node.ownerDocument.documentElement;
  const parent = node.parentNode;
  return (
    doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent))
  );
}
