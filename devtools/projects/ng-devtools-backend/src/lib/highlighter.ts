/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let overlay: any;
let overlayContent: HTMLElement;

declare const ng: any;

interface Type<T> extends Function {
  new (...args: any[]): T;
}

const DEV_TOOLS_HIGHLIGHT_NODE_ID = '____ngDevToolsHighlight';

function init(): void {
  if (overlay) {
    return;
  }
  overlay = document.createElement('div');
  overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)';
  overlay.style.position = 'fixed';
  overlay.style.zIndex = '2147483647';
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'flex';
  overlay.style.borderRadius = '3px';
  overlay.id = DEV_TOOLS_HIGHLIGHT_NODE_ID;
  overlayContent = document.createElement('div');
  overlayContent.style.backgroundColor = 'rgba(104, 182, 255, 0.9)';
  overlayContent.style.position = 'absolute';
  overlayContent.style.fontFamily = 'monospace';
  overlayContent.style.fontSize = '11px';
  overlayContent.style.padding = '2px 3px';
  overlayContent.style.borderRadius = '3px';
  overlayContent.style.color = 'white';
  overlay.appendChild(overlayContent);
}

export const findComponentAndHost = (
  el: Node | undefined,
): {component: any; host: HTMLElement | null} => {
  if (!el) {
    return {component: null, host: null};
  }
  while (el) {
    const component = el instanceof HTMLElement && ng.getComponent(el);
    if (component) {
      return {component, host: el as HTMLElement};
    }
    if (!el.parentElement) {
      break;
    }
    el = el.parentElement;
  }
  return {component: null, host: null};
};

// Todo(aleksanderbodurri): this should not be part of the highlighter, move this somewhere else
export function getDirectiveName(dir: Type<unknown> | undefined | null): string {
  return dir ? dir.constructor.name : 'unknown';
}

export function highlight(el: HTMLElement): void {
  const cmp = findComponentAndHost(el).component;
  const rect = getComponentRect(el);

  init();
  if (rect) {
    const content: Node[] = [];
    const name = getDirectiveName(cmp);
    if (name) {
      const pre = document.createElement('span');
      pre.style.opacity = '0.6';
      pre.innerText = '<';
      const text = document.createTextNode(name);
      const post = document.createElement('span');
      post.style.opacity = '0.6';
      post.innerText = '>';
      content.push(pre, text, post);
    }
    showOverlay(rect, content);
  }
}

export function unHighlight(): void {
  if (overlay && overlay.parentNode) {
    document.body.removeChild(overlay);
  }
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

function getComponentRect(el: Node): DOMRect | undefined {
  if (!(el instanceof HTMLElement)) {
    return;
  }
  if (!inDoc(el)) {
    return;
  }
  return el.getBoundingClientRect();
}

function showOverlay(dimensions: DOMRect, content: Node[]): void {
  const {width, height, top, left} = dimensions;
  overlay.style.width = ~~width + 'px';
  overlay.style.height = ~~height + 'px';
  overlay.style.top = ~~top + 'px';
  overlay.style.left = ~~left + 'px';

  positionOverlayContent(dimensions);
  overlayContent.replaceChildren();

  content.forEach((child) => overlayContent.appendChild(child));

  document.body.appendChild(overlay);
}

function positionOverlayContent(dimensions: DOMRect) {
  const {innerWidth: viewportWidth, innerHeight: viewportHeight} = window;
  const style = overlayContent.style;
  const yOffset = 23;
  const yOffsetValue = `-${yOffset}px`;

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
