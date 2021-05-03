/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {RComment, RElement, RNode, RText} from '@angular/core/src/render3/interfaces/renderer_dom';
import {ProceduralRenderer3, Renderer3, RendererFactory3, RendererStyleFlags3} from '../../../src/render3/interfaces/renderer';

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

export class MicroBenchmarkRenderer implements ProceduralRenderer3 {
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
  destroyNode?: ((node: RNode) => void)|null|undefined;
  appendChild(parent: RElement, newChild: RNode): void {}
  insertBefore(parent: RNode, newChild: RNode, refChild: RNode|null): void {}
  removeChild(parent: RElement, oldChild: RNode, isHostElement?: boolean|undefined): void {}
  selectRootElement(selectorOrNode: any): RElement {
    throw new Error('Method not implemented.');
  }
  parentNode(node: RNode): RElement|null {
    return null;
  }
  nextSibling(node: RNode): RNode|null {
    throw new Error('Method not implemented.');
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
  setStyle(el: RElement, style: string, value: any, flags?: RendererStyleFlags3|undefined): void {}
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags3|undefined): void {}
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

export class MicroBenchmarkRendererFactory implements RendererFactory3 {
  createRenderer(hostElement: RElement|null, rendererType: null): Renderer3 {
    if (typeof global !== 'undefined') {
      (global as any).Node = MicroBenchmarkRenderNode;
    }
    return new MicroBenchmarkRenderer();
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
