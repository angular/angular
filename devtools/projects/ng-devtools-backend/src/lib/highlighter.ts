/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Type} from '@angular/core';
import {HydrationStatus} from '../../../protocol';
import {ngDebugClient} from './ng-debug-api/ng-debug-api';

let hydrationOverlayItems: HTMLElement[] = [];
let selectedElementOverlay: HTMLElement | null = null;
let selectedElement: Node | null = null;

const DEV_TOOLS_HIGHLIGHT_NODE_ID = '____ngDevToolsHighlight';

const OVERLAY_CONTENT_MARGIN = 4;
const MINIMAL_OVERLAY_CONTENT_SIZE = {
  width: 30 + OVERLAY_CONTENT_MARGIN * 2,
  height: 20 + OVERLAY_CONTENT_MARGIN * 2,
};

type RgbColor = readonly [red: number, green: number, blue: number];
const COLORS = {
  blue: [104, 182, 255],
  red: [255, 0, 64],
  grey: [128, 128, 128],
} satisfies Record<string, RgbColor>;

// Those are the SVG we inline in case the overlay label is to long for the container component.
const HYDRATION_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><rect fill="none" height="24" width="24"/><path d="M12,2c-5.33,4.55-8,8.48-8,11.8c0,4.98,3.8,8.2,8,8.2s8-3.22,8-8.2C20,10.48,17.33,6.55,12,2z M12,20c-3.35,0-6-2.57-6-6.2 c0-2.34,1.95-5.44,6-9.14c4.05,3.7,6,6.79,6,9.14C18,17.43,15.35,20,12,20z M7.83,14c0.37,0,0.67,0.26,0.74,0.62 c0.41,2.22,2.28,2.98,3.64,2.87c0.43-0.02,0.79,0.32,0.79,0.75c0,0.4-0.32,0.73-0.72,0.75c-2.13,0.13-4.62-1.09-5.19-4.12 C7.01,14.42,7.37,14,7.83,14z"/></svg>`;
const HYDRATION_SKIPPED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><rect fill="none" height="24" width="24"/><path d="M21.19,21.19L2.81,2.81L1.39,4.22l4.2,4.2c-1,1.31-1.6,2.94-1.6,4.7C4,17.48,7.58,21,12,21c1.75,0,3.36-0.56,4.67-1.5 l3.1,3.1L21.19,21.19z M12,19c-3.31,0-6-2.63-6-5.87c0-1.19,0.36-2.32,1.02-3.28L12,14.83V19z M8.38,5.56L12,2l5.65,5.56l0,0 C19.1,8.99,20,10.96,20,13.13c0,1.18-0.27,2.29-0.74,3.3L12,9.17V4.81L9.8,6.97L8.38,5.56z"/></svg>`;
const HYDRATION_ERROR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`;

function createOverlay(color: RgbColor): {overlay: HTMLElement; overlayContent: HTMLElement} {
  const overlay = document.createElement('div');
  overlay.className = 'ng-devtools-overlay';
  overlay.style.backgroundColor = toCSSColor(...color, 0.35);
  overlay.style.position = 'absolute';
  overlay.style.zIndex = '2147483647';
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'flex';
  overlay.style.borderRadius = '3px';
  overlay.id = DEV_TOOLS_HIGHLIGHT_NODE_ID;
  const overlayContent = document.createElement('div');
  overlayContent.style.backgroundColor = toCSSColor(...color, 0.9);
  overlayContent.style.position = 'absolute';
  overlayContent.style.fontFamily = 'monospace';
  overlayContent.style.fontSize = '11px';
  overlayContent.style.padding = '2px 3px';
  overlayContent.style.borderRadius = '3px';
  overlayContent.style.color = 'white';
  overlay.appendChild(overlayContent);
  return {overlay, overlayContent};
}

export function findComponentAndHost(el: Node | undefined): {
  component: any;
  host: HTMLElement | null;
} {
  const ng = ngDebugClient();
  if (!el) {
    return {component: null, host: null};
  }
  while (el) {
    const component = el instanceof HTMLElement && ng.getComponent!(el);
    if (component) {
      return {component, host: el as HTMLElement};
    }
    if (!el.parentElement) {
      break;
    }
    el = el.parentElement;
  }
  return {component: null, host: null};
}

// Todo(aleksanderbodurri): this should not be part of the highlighter, move this somewhere else
export function getDirectiveName(dir: Type<unknown> | undefined | null): string {
  return dir ? dir.constructor.name : 'unknown';
}

export function highlightSelectedElement(el: Node): void {
  if (el === selectedElement) {
    return;
  }
  unHighlight();
  selectedElementOverlay = addHighlightForElement(el);
  selectedElement = el;
}

export function highlightHydrationElement(el: Node, status: HydrationStatus) {
  let overlay: HTMLElement | null = null;
  if (status?.status === 'skipped') {
    overlay = addHighlightForElement(el, COLORS.grey, status?.status);
  } else if (status?.status === 'mismatched') {
    overlay = addHighlightForElement(el, COLORS.red, status?.status);
  } else if (status?.status === 'hydrated') {
    overlay = addHighlightForElement(el, COLORS.blue, status?.status);
  }

  if (overlay) {
    hydrationOverlayItems.push(overlay);
  }
}

export function unHighlight(): void {
  if (!selectedElementOverlay) {
    return;
  }

  for (const node of document.body.childNodes) {
    if (node === selectedElementOverlay) {
      document.body.removeChild(selectedElementOverlay);

      break;
    }
  }

  selectedElementOverlay = null;
}

export function removeHydrationHighlights(): void {
  hydrationOverlayItems.forEach((overlay) => {
    document.body.removeChild(overlay);
  });
  hydrationOverlayItems = [];
}

export function inDoc(node: any): boolean {
  if (!node) {
    return false;
  }
  const doc = node.ownerDocument.documentElement;
  const parent = node.parentNode;
  return (
    doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent))
  );
}

function addHighlightForElement(
  el: Node,
  color: RgbColor = COLORS.blue,
  overlayType?: NonNullable<HydrationStatus>['status'],
): HTMLElement | null {
  const cmp = findComponentAndHost(el).component;
  const rect = getComponentRect(el);
  if (rect?.height === 0 || rect?.width === 0) {
    // display nothing in case the component is not visible
    return null;
  }

  const {overlay, overlayContent} = createOverlay(color);
  if (!rect) return null;

  const content: Node[] = [];
  const componentName = getDirectiveName(cmp);

  // We display an icon inside the overlay if the container computer is wide enough
  if (overlayType) {
    if (
      rect.width > MINIMAL_OVERLAY_CONTENT_SIZE.width &&
      rect.height > MINIMAL_OVERLAY_CONTENT_SIZE.height
    ) {
      // 30x20 + 8px margin
      const svg = createOverlaySvgElement(overlayType!);
      content.push(svg);
    }
  } else if (componentName) {
    const middleText = document.createTextNode(componentName);
    const pre = document.createElement('span');
    pre.innerText = `<`;
    const post = document.createElement('span');
    post.innerText = `>`;
    content.push(pre, middleText, post);
  }
  showOverlay(overlay, overlayContent, rect, content, overlayType ? 'inside' : 'outside');
  return overlay;
}

function getComponentRect(el: Node): DOMRect | undefined {
  if (!(el instanceof HTMLElement)) {
    return;
  }
  if (!inDoc(el)) {
    return;
  }
  return el.getBoundingClientRect();
}

function showOverlay(
  overlay: HTMLElement,
  overlayContent: HTMLElement,
  dimensions: DOMRect,
  content: Node[],
  labelPosition: 'inside' | 'outside',
): void {
  const {width, height, top, left} = dimensions;
  overlay.style.width = ~~width + 'px';
  overlay.style.height = ~~height + 'px';
  overlay.style.top = ~~top + window.scrollY + 'px';
  overlay.style.left = ~~left + window.scrollX + 'px';

  positionOverlayContent(overlayContent, dimensions, labelPosition);
  overlayContent.replaceChildren();

  if (content.length) {
    content.forEach((child) => overlayContent.appendChild(child));
  } else {
    // If the overlay label has no content, remove it from the DOM.
    overlay.removeChild(overlayContent);
  }

  document.body.appendChild(overlay);
}

function positionOverlayContent(
  overlayContent: HTMLElement,
  dimensions: DOMRect,
  labelPosition: 'inside' | 'outside',
) {
  const {innerWidth: viewportWidth, innerHeight: viewportHeight} = window;
  const style = overlayContent.style;
  const yOffset = 23;
  const yOffsetValue = `-${yOffset}px`;

  if (labelPosition === 'inside') {
    style.top = `${OVERLAY_CONTENT_MARGIN}px`;
    style.right = `${OVERLAY_CONTENT_MARGIN}px`;
    return;
  }

  // Clear any previous positioning styles.
  style.top = style.bottom = style.left = style.right = '';

  // Attempt to position the content element so that it's always in the
  // viewport along the Y axis. Prefer to position on the bottom.
  if (dimensions.bottom + yOffset <= viewportHeight) {
    style.bottom = yOffsetValue;
    // If it doesn't fit on the bottom, try to position on top.
  } else if (dimensions.top - yOffset >= 0) {
    style.top = yOffsetValue;
    // Otherwise offset from the bottom until it fits on the screen.
  } else {
    style.bottom = `${Math.max(dimensions.bottom - viewportHeight, 0)}px`;
  }

  // Attempt to position the content element so that it's always in the
  // viewport along the X axis. Prefer to position on the right.
  if (dimensions.right <= viewportWidth) {
    style.right = '0';
    // If it doesn't fit on the right, try to position on left.
  } else if (dimensions.left >= 0) {
    style.left = '0';
    // Otherwise offset from the right until it fits on the screen.
  } else {
    style.right = `${Math.max(dimensions.right - viewportWidth, 0)}px`;
  }
}

function toCSSColor(red: number, green: number, blue: number, alpha = 1): string {
  return `rgba(${red},${green},${blue},${alpha})`;
}

function createOverlaySvgElement(type: NonNullable<HydrationStatus>['status']): Node {
  let icon: string;
  if (type === 'hydrated') {
    icon = HYDRATION_SVG;
  } else if (type === 'mismatched') {
    icon = HYDRATION_ERROR_SVG;
  } else if (type === 'skipped') {
    icon = HYDRATION_SKIPPED_SVG;
  } else {
    throw new Error(`No icon specified for type ${type}`);
  }

  const svg = new DOMParser().parseFromString(icon, 'image/svg+xml').childNodes[0] as SVGElement;
  svg.style.fill = 'white';
  svg.style.height = '1.5em';
  return svg;
}
