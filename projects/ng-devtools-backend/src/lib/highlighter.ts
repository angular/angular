import { Type } from '@angular/core';

let overlay;
let overlayContent;

declare const ng: any;

function init() {
  if (overlay) {
    return;
  }
  overlay = document.createElement('div');
  overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)';
  overlay.style.position = 'fixed';
  overlay.style.zIndex = '2147483647';
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.borderRadius = '3px';
  overlayContent = document.createElement('div');
  overlayContent.style.backgroundColor = 'rgba(104, 182, 255, 0.9)';
  overlayContent.style.fontFamily = 'monospace';
  overlayContent.style.fontSize = '11px';
  overlayContent.style.padding = '2px 3px';
  overlayContent.style.borderRadius = '3px';
  overlayContent.style.color = 'white';
  overlay.appendChild(overlayContent);
}

export const findComponentAndHost = (el: HTMLElement) => {
  if (!el) {
    return;
  }
  while (el) {
    const component = ng.getComponent(el);
    if (component) {
      return { component, host: el };
    }
    el = el.parentElement;
  }
  return { component: null, host: null };
};

export const getComponentName = (cmp: Type<unknown>) => {
  if (cmp) {
    return cmp.constructor.name;
  }
  return null;
};

export const highlight = (el: HTMLElement) => {
  const cmp = findComponentAndHost(el).component;
  const rect = getComponentRect(el);

  init();
  if (rect) {
    const content = [];
    const name = getComponentName(cmp);
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
};

export function unHighlight() {
  if (overlay && overlay.parentNode) {
    document.body.removeChild(overlay);
  }
}

export function inDoc(node) {
  if (!node) {
    return false;
  }
  const doc = node.ownerDocument.documentElement;
  const parent = node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

export function getComponentRect(el: HTMLElement) {
  if (!inDoc(el)) {
    return;
  }
  return el.getBoundingClientRect();
}

function showOverlay({ width = 0, height = 0, top = 0, left = 0 }, content = []) {
  overlay.style.width = ~~width + 'px';
  overlay.style.height = ~~height + 'px';
  overlay.style.top = ~~top + 'px';
  overlay.style.left = ~~left + 'px';

  overlayContent.innerHTML = '';
  content.forEach(child => overlayContent.appendChild(child));

  document.body.appendChild(overlay);
}
