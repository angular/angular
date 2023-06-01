/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RendererStyleFlags2} from '@angular/core/src/render';
import {Renderer, RendererFactory} from '@angular/core/src/render3/interfaces/renderer';
import {RComment, RElement, RNode, RText} from '@angular/core/src/render3/interfaces/renderer_dom';

export class MicroBenchmarkRenderNode implements RNode, RComment, RText {
  tagName?: string;
  nodeType?: number;
  textContent: string|null = null;
  parentNode: RNode|null = null;
  parentElement: RElement|null = null;
  nextSibling: RNode|null = null;
  removeChild(oldChild: RNode): RNode {
    return oldChild;
  }
  insertBefore(newChild: RNode, refChild: RNode|null, isViewRoot: boolean): void {}
  appendChild(newChild: RNode): RNode {
    return newChild;
  }
  className: string = '';
}

export class MicroBenchmarkRenderer implements Renderer {
  get data(): any {
    throw new Error('Not implemented.');
  }
  destroy(): void {
    throw new Error('Method not implemented.');
  }
  createComment(value: string): RComment {
    return new MicroBenchmarkRenderNode();
  }
  createElement(name: string, namespace?: string|null|undefined): RElement {
    return new MicroBenchmarkRenderNode() as any as RElement;
  }
  createText(value: string): RText {
    return new MicroBenchmarkRenderNode();
  }
  appendChild(parent: RElement, newChild: RNode): void {}
  insertBefore(parent: RNode, newChild: RNode, refChild: RNode|null): void {}
  removeChild(parent: RElement, oldChild: RNode, isHostElement?: boolean|undefined): void {}
  destroyNode: ((node: any) => void)|null = null;
  selectRootElement(selectorOrNode: any): RElement {
    throw new Error('Method not implemented.');
  }
  parentNode(node: RNode): RElement|null {
    return null;
  }
  nextSibling(node: RNode): RNode|null {
    return null;
  }
  setAttribute(el: RElement, name: string, value: string, namespace?: string|null|undefined): void {
    if (name === 'class' && isOurNode(el)) {
      el.className = value;
    }
  }
  removeAttribute(el: RElement, name: string, namespace?: string|null|undefined): void {}
  addClass(el: RElement, name: string): void {
    if (isOurNode(el)) {
      el.className = el.className === '' ? name : remove(el.className, name) + ' ' + name;
    }
  }
  removeClass(el: RElement, name: string): void {
    if (isOurNode(el)) {
      el.className = remove(el.className, name);
    }
  }
  setStyle(el: RElement, style: string, value: any, flags?: RendererStyleFlags2|undefined): void {}
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags2|undefined): void {}
  setProperty(el: RElement, name: string, value: any): void {}
  setValue(node: RComment|RText, value: string): void {
    node.textContent = value;
  }
  listen(
      target: RNode|'document'|'window'|'body', eventName: string,
      callback: (event: any) => boolean | void): () => void {
    return () => {};
  }
}

export class MicroBenchmarkRendererFactory implements RendererFactory {
  createRenderer(hostElement: RElement|null, rendererType: null): Renderer {
    if (typeof global !== 'undefined') {
      (global as any).Node = MicroBenchmarkRenderNode;
    }
    return new MicroBenchmarkRenderer();
  }
}

class MicroBenchmarkDomRenderer implements Renderer {
  get data(): any {
    throw new Error('Not implemented.');
  }
  destroy(): void {
    throw new Error('Method not implemented.');
  }
  createElement(name: string, namespace?: string): any {
    return document.createElement(name);
  }

  createComment(value: string): any {
    return document.createComment(value);
  }

  createText(value: string): any {
    return document.createTextNode(value);
  }

  appendChild(parent: any, newChild: any): void {
    parent.appendChild(newChild);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    parent.insertBefore(newChild, refChild);
  }

  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }

  selectRootElement(selectorOrNode: string|any, preserveContent?: boolean): any {
    let el: any = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
                                                       selectorOrNode;
    if (!el) {
      throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
    }
    if (!preserveContent) {
      el.textContent = '';
    }
    return el;
  }

  parentNode(node: any): any {
    return node.parentNode;
  }

  nextSibling(node: any): any {
    return node.nextSibling;
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    el.setAttribute(name, value);
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    el.removeAttribute(name);
  }

  addClass(el: any, name: string): void {
    el.classList.add(name);
  }

  removeClass(el: any, name: string): void {
    el.classList.remove(name);
  }

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    if (flags & (RendererStyleFlags2.DashCase | RendererStyleFlags2.Important)) {
      el.style.setProperty(style, value, flags & RendererStyleFlags2.Important ? 'important' : '');
    } else {
      el.style[style] = value;
    }
  }

  removeStyle(el: any, style: string, flags: RendererStyleFlags2): void {
    if (flags & RendererStyleFlags2.DashCase) {
      el.style.removeProperty(style);
    } else {
      el.style[style] = '';
    }
  }

  setProperty(el: any, name: string, value: any): void {
    el[name] = value;
  }

  setValue(node: any, value: string): void {
    node.nodeValue = value;
  }

  listen(target: 'window'|'document'|'body'|any, event: string, callback: (event: any) => boolean):
      () => void {
    return () => {};
  }
}

export class MicroBenchmarkDomRendererFactory implements RendererFactory {
  createRenderer(hostElement: RElement|null, rendererType: null): Renderer {
    return new MicroBenchmarkDomRenderer();
  }
}

function isOurNode(node: any): node is MicroBenchmarkRenderNode {
  return node instanceof MicroBenchmarkRenderNode;
}

const enum Code {
  SPACE = 32,
}

function remove(text: string, key: string): string {
  let wasLastWhitespace = true;
  for (let i = 0; i < text.length; i++) {
    if (wasLastWhitespace) {
      const start = i;
      let same = true;
      let k = 0;
      while (k < key.length && (same = text.charCodeAt(i) === key.charCodeAt(k))) {
        k++;
        i++;
      }
      if (same && text.charCodeAt(i) == Code.SPACE) {
        return text.substring(0, start) + text.substring(i + 1);
      }
    }
    wasLastWhitespace = text.charCodeAt(i) <= Code.SPACE;
  }
  return text;
}
