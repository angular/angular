/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';
import * as v1 from '../render/api';

import {DebugContext, RendererV2} from './types';

export class DirectDomRenderer implements RendererV2 {
  createElement(name: string): any { return document.createElement(name); }
  createComment(value: string): any { return document.createComment(value); }
  createText(value: string): any { return document.createTextNode(value); }
  appendChild(parent: any, newChild: any): void { parent.appendChild(newChild); }
  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }
  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }
  selectRootElement(selectorOrNode: string|any, debugInfo?: DebugContext): any {
    let el: any;
    if (typeof selectorOrNode === 'string') {
      el = document.querySelector(selectorOrNode);
    } else {
      el = selectorOrNode;
    }
    el.textContent = '';
    return el;
  }
  parentNode(node: any): any { return node.parentNode; }
  nextSibling(node: any): any { return node.nextSiblibng; }
  setAttribute(el: any, name: string, value: string): void { return el.setAttribute(name, value); }
  removeAttribute(el: any, name: string): void { el.removeAttribute(name); }
  setBindingDebugInfo(el: any, propertyName: string, propertyValue: string): void {}
  removeBindingDebugInfo(el: any, propertyName: string): void {}
  addClass(el: any, name: string): void { el.classList.add(name); }
  removeClass(el: any, name: string): void { el.classList.remove(name); }
  setStyle(el: any, style: string, value: any): void { el.style[style] = value; }
  removeStyle(el: any, style: string): void {
    // IE requires '' instead of null
    // see https://github.com/angular/angular/issues/7916
    (el.style as any)[style] = '';
  }
  setProperty(el: any, name: string, value: any): void { el[name] = value; }
  setText(node: any, value: string): void { node.nodeValue = value; }
  listen(target: any, eventName: string, callback: (event: any) => boolean): () => void {
    let renderTarget: any;
    switch (target) {
      case 'window':
        renderTarget = window;
        break;
      case 'document':
        renderTarget = document;
        break;
      default:
        renderTarget = target;
    }
    const closure = (event: any) => {
      if (callback(event) === false) {
        event.preventDefault();
      }
    };
    renderTarget.addEventListener(eventName, closure);
    return () => renderTarget.removeEventListener(eventName, closure);
  }
}

const EMPTY_V1_RENDER_COMPONENT_TYPE =
    new v1.RenderComponentType('EMPTY', '', 0, ViewEncapsulation.None, [], {});

/**
 * A temporal implementation of `Renderer` until we migrated our current renderer
 * in all packages to the new API.
 *
 * Note that this is not complete, e.g. does not support shadow dom, view encapsulation, ...!
 */
export class LegacyRendererAdapter implements RendererV2 {
  private _delegate: v1.Renderer;
  constructor(rootDelegate: v1.RootRenderer) {
    this._delegate = rootDelegate.renderComponent(EMPTY_V1_RENDER_COMPONENT_TYPE);
  }
  createElement(name: string, debugInfo?: DebugContext): any {
    return this._delegate.createElement(null, name, debugInfo);
  }
  createComment(value: string, debugInfo?: DebugContext): any {
    return this._delegate.createTemplateAnchor(null, debugInfo);
  }
  createText(value: string, debugInfo?: DebugContext): any {
    return this._delegate.createText(null, value, debugInfo);
  }
  appendChild(parent: any, newChild: any): void { this._delegate.projectNodes(parent, [newChild]); }
  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (refChild) {
      this._delegate.attachViewAfter(refChild.previousSibling, [newChild]);
    } else {
      this.appendChild(parent, newChild);
    }
  }
  removeChild(parent: any, oldChild: any): void {
    if (parent) {
      this._delegate.detachView([oldChild]);
    }
  }
  selectRootElement(selectorOrNode: any, debugInfo?: DebugContext): any {
    return this._delegate.selectRootElement(selectorOrNode, debugInfo);
  }
  parentNode(node: any): any { return node.parentNode; }
  nextSibling(node: any): any { return node.nextSibling; }
  setAttribute(el: any, name: string, value: string): void {
    this._delegate.setElementAttribute(el, name, value);
  }
  removeAttribute(el: any, name: string): void {
    this._delegate.setElementAttribute(el, name, null);
  }
  setBindingDebugInfo(el: any, propertyName: string, propertyValue: string): void {
    this._delegate.setBindingDebugInfo(el, propertyName, propertyValue);
  }
  removeBindingDebugInfo(el: any, propertyName: string): void {
    this._delegate.setBindingDebugInfo(el, propertyName, null);
  }
  addClass(el: any, name: string): void { this._delegate.setElementClass(el, name, true); }
  removeClass(el: any, name: string): void { this._delegate.setElementClass(el, name, false); }
  setStyle(el: any, style: string, value: any): void {
    this._delegate.setElementStyle(el, style, value);
  }
  removeStyle(el: any, style: string): void { this._delegate.setElementStyle(el, style, null); }
  setProperty(el: any, name: string, value: any): void {
    this._delegate.setElementProperty(el, name, value);
  }
  setText(node: any, value: string): void { this._delegate.setText(node, value); }
  listen(target: any, eventName: string, callback: (event: any) => boolean): () => void {
    if (typeof target === 'string') {
      return <any>this._delegate.listenGlobal(target, eventName, callback);
    } else {
      return <any>this._delegate.listen(target, eventName, callback);
    }
  }
}
