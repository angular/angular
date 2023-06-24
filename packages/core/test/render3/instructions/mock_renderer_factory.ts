/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererStyleFlags2, RendererType2} from '@angular/core';
import {Renderer, RendererFactory} from '@angular/core/src/render3/interfaces/renderer';
import {RElement} from '@angular/core/src/render3/interfaces/renderer_dom';

export class MockRendererFactory implements RendererFactory {
  wasCalled = false;
  createRenderer(hostElement: RElement|null, rendererType: RendererType2|null): Renderer {
    this.wasCalled = true;
    return new MockRenderer();
  }
}

class MockRenderer implements Renderer {
  data = {};

  destroyNode: ((node: any) => void)|null = null;

  destroy(): void {}
  createComment(value: string): Comment {
    return document.createComment(value);
  }
  createElement(name: string, namespace?: string|null): RElement {
    return namespace ? document.createElementNS(namespace, name) as unknown as RElement :
                       document.createElement(name);
  }
  createText(value: string): Text {
    return document.createTextNode(value);
  }
  appendChild(parent: RElement, newChild: Node): void {
    parent.appendChild(newChild);
  }
  insertBefore(parent: Node, newChild: Node, refChild: Node|null): void {
    parent.insertBefore(newChild, refChild);
  }
  removeChild(parent: RElement, oldChild: Node): void {
    parent.removeChild(oldChild);
  }
  selectRootElement(selectorOrNode: string|any): RElement {
    return typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
                                                selectorOrNode;
  }
  parentNode(node: Node): RElement|null {
    return node.parentNode as RElement | null;
  }
  nextSibling(node: Node): Node|null {
    return node.nextSibling;
  }
  setAttribute(el: RElement, name: string, value: string, namespace?: string|null): void {
    // set all synthetic attributes as properties
    if (name[0] === '@') {
      this.setProperty(el, name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
  removeAttribute(el: RElement, name: string, namespace?: string|null): void {}
  addClass(el: RElement, name: string): void {
    el.classList.add(name);
  }
  removeClass(el: RElement, name: string): void {
    el.classList.remove(name);
  }
  setStyle(el: RElement, style: string, value: any, flags: RendererStyleFlags2): void {
    if (flags & (RendererStyleFlags2.DashCase | RendererStyleFlags2.Important)) {
      el.style.setProperty(style, value, flags & RendererStyleFlags2.Important ? 'important' : '');
    } else {
      el.style.setProperty(style, value);
    }
  }
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags2): void {
    el.style.removeProperty(style);
  }
  setProperty(el: RElement, name: string, value: any): void {
    (el as any)[name] = value;
  }
  setValue(node: Text, value: string): void {
    node.textContent = value;
  }

  // TODO: Deprecate in favor of addEventListener/removeEventListener
  listen(target: Node, eventName: string, callback: (event: any) => boolean | void): () => void {
    return () => {};
  }
}
