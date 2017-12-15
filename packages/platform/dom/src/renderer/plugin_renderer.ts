/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererFactory2, Renderer2, RendererType2, RendererStyleFlags2} from '@angular/core';

const doc: Document = document;

export class DomPluginRendererFactory implements RendererFactory2 {
  createRenderer(hostElement: Node, type: RendererType2): Renderer2 {
    return new DomPluginRenderer(hostElement, type);
  }
}

export class DomPluginRenderer implements  Renderer2 {
  data: { [p: string]: any };
  destroyNode: ((node: any) => void) | any;

  constructor(hostElement: Node, type: RendererType2) {
  }

  destroy(): void {
  }

  createElement(name: string, namespace?: string | any): HTMLElement {
    return doc.createElement(name);
  }

  createComment(value: string): Comment {
    return doc.createComment(value);
  }

  createText(value: string): Text {
    return doc.createTextNode(value);
  }

  appendChild(parent: Node, newChild: Node): void {
    parent.appendChild(newChild);
  }

  insertBefore(parent: Node, newChild: Node, refChild: Node): void {
    parent.insertBefore(newChild, refChild);
  }

  removeChild(parent: Node, oldChild: Node): void {
    parent.removeChild(oldChild);
  }

  selectRootElement(selectorOrNode: string | Element): Element|null {
    if (typeof  selectorOrNode === 'string') {
      return doc.querySelector(selectorOrNode);
    } else {
      return selectorOrNode;
    }
  }

  parentNode(node: Node): Node|null {
    return node.parentNode;
  }

  nextSibling(node: Node): Node|null {
    return node.nextSibling;
  }

  setAttribute(el: HTMLElement, name: string, value: string, namespace?: string | any): void {
    el.setAttribute(name, value);
  }

  removeAttribute(el: HTMLElement, name: string, namespace?: string | any): void {
    el.removeAttribute(name);
  }

  addClass(el: HTMLElement, name: string): void {
    el.classList.add(name);
  }

  removeClass(el: HTMLElement, name: string): void {
    el.classList.remove(name);
  }

  setStyle(el: HTMLElement, style: string, value: any, flags: RendererStyleFlags2): void {
    if (flags & RendererStyleFlags2.DashCase) {
      el.style.setProperty(
        style, value, !!(flags & RendererStyleFlags2.Important) ? 'important' : '');
    } else {
      (el.style as any)[style] = value;
    }
  }

  removeStyle(el: HTMLElement, style: string, flags: RendererStyleFlags2): void {
    if (flags & RendererStyleFlags2.DashCase) {
      el.style.removeProperty(style);
    } else {
      // IE requires '' instead of null
      // see https://github.com/angular/angular/issues/7916
      (el.style as any)[style] = '';
    }
  }

  setProperty(el: HTMLElement, name: string, value: any): void {
    (el as any)[name] = value;
  }

  setValue(node: Node, value: string): void {
    node.nodeValue = value;
  }

  listen(target: string | HTMLElement, eventName: string, callback: (event: any) => (boolean | void)): () => void {
    const decoratedCallback = decoratePreventDefault(callback) as any;
    if (typeof target === 'string') {
      const body = doc.body;
      doc.body.addEventListener(eventName, decoratedCallback);
      return () => body.removeEventListener(eventName, decoratedCallback);
    } else {
      target.addEventListener(eventName, decoratedCallback);
      return () => target.removeEventListener(eventName, decoratedCallback);
    }
  }

}

function decoratePreventDefault(eventHandler: Function): Function {
  return (event: any) => {
    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      // TODO(tbosch): move preventDefault into event plugins...
      event.preventDefault();
      event.returnValue = false;
    }
  };
}
