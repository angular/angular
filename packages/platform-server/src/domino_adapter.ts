/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const domino = require('domino');

import {ɵBrowserDomAdapter as BrowserDomAdapter, ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/platform-browser';

function _notImplemented(methodName: string) {
  return new Error('This method is not implemented in DominoAdapter: ' + methodName);
}

function setDomTypes() {
  // Make all Domino types available as types in the global env.
  Object.assign(global, domino.impl);
  (global as any)['KeyboardEvent'] = domino.impl.Event;
}

/**
 * Parses a document string to a Document object.
 */
export function parseDocument(html: string, url = '/') {
  let window = domino.createWindow(html, url);
  let doc = window.document;
  return doc;
}

/**
 * Serializes a document to string.
 */
export function serializeDocument(doc: Document): string {
  return (doc as any).serialize();
}

/**
 * DOM Adapter for the server platform based on https://github.com/fgnass/domino.
 */
export class DominoAdapter extends BrowserDomAdapter {
  static makeCurrent() {
    setDomTypes();
    setRootDomAdapter(new DominoAdapter());
  }

  private static defaultDoc: Document;

  logError(error: string) { console.error(error); }

  log(error: string) {
    // tslint:disable-next-line:no-console
    console.log(error);
  }

  logGroup(error: string) { console.error(error); }

  logGroupEnd() {}

  supportsDOMEvents(): boolean { return false; }
  supportsNativeShadowDOM(): boolean { return false; }

  contains(nodeA: any, nodeB: any): boolean {
    let inner = nodeB;
    while (inner) {
      if (inner === nodeA) return true;
      inner = inner.parent;
    }
    return false;
  }

  createHtmlDocument(): HTMLDocument {
    return parseDocument('<html><head><title>fakeTitle</title></head><body></body></html>');
  }

  getDefaultDocument(): Document {
    if (!DominoAdapter.defaultDoc) {
      DominoAdapter.defaultDoc = domino.createDocument();
    }
    return DominoAdapter.defaultDoc;
  }

  createShadowRoot(el: any, doc: Document = document): DocumentFragment {
    el.shadowRoot = doc.createDocumentFragment();
    el.shadowRoot.parent = el;
    return el.shadowRoot;
  }
  getShadowRoot(el: any): DocumentFragment { return el.shadowRoot; }

  isTextNode(node: any): boolean { return node.nodeType === DominoAdapter.defaultDoc.TEXT_NODE; }
  isCommentNode(node: any): boolean {
    return node.nodeType === DominoAdapter.defaultDoc.COMMENT_NODE;
  }
  isElementNode(node: any): boolean {
    return node ? node.nodeType === DominoAdapter.defaultDoc.ELEMENT_NODE : false;
  }
  hasShadowRoot(node: any): boolean { return node.shadowRoot != null; }
  isShadowRoot(node: any): boolean { return this.getShadowRoot(node) == node; }

  getProperty(el: Element, name: string): any {
    if (name === 'href') {
      // Domino tries tp resolve href-s which we do not want. Just return the
      // attribute value.
      return this.getAttribute(el, 'href');
    } else if (name === 'innerText') {
      // Domino does not support innerText. Just map it to textContent.
      return el.textContent;
    }
    return (<any>el)[name];
  }

  setProperty(el: Element, name: string, value: any) {
    if (name === 'href') {
      // Even though the server renderer reflects any properties to attributes
      // map 'href' to attribute just to handle when setProperty is directly called.
      this.setAttribute(el, 'href', value);
    } else if (name === 'innerText') {
      // Domino does not support innerText. Just map it to textContent.
      el.textContent = value;
    }
    (<any>el)[name] = value;
  }

  getGlobalEventTarget(doc: Document, target: string): EventTarget|null {
    if (target === 'window') {
      return doc.defaultView;
    }
    if (target === 'document') {
      return doc;
    }
    if (target === 'body') {
      return doc.body;
    }
    return null;
  }

  getBaseHref(doc: Document): string {
    const base = this.querySelector(doc.documentElement !, 'base');
    let href = '';
    if (base) {
      href = this.getHref(base);
    }
    // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
    return href;
  }

  /** @internal */
  _readStyleAttribute(element: any): {[name: string]: string} {
    const styleMap: {[name: string]: string} = {};
    const styleAttribute = element.getAttribute('style');
    if (styleAttribute) {
      const styleList = styleAttribute.split(/;+/g);
      for (let i = 0; i < styleList.length; i++) {
        const style = styleList[i].trim();
        if (style.length > 0) {
          const colonIndex = style.indexOf(':');
          if (colonIndex === -1) {
            throw new Error(`Invalid CSS style: ${style}`);
          }
          const name = style.substr(0, colonIndex).trim();
          styleMap[name] = style.substr(colonIndex + 1).trim();
        }
      }
    }
    return styleMap;
  }
  /** @internal */
  _writeStyleAttribute(element: any, styleMap: {[name: string]: string}) {
    let styleAttrValue = '';
    for (const key in styleMap) {
      const newValue = styleMap[key];
      if (newValue) {
        styleAttrValue += key + ':' + styleMap[key] + ';';
      }
    }
    element.setAttribute('style', styleAttrValue);
  }
  setStyle(element: any, styleName: string, styleValue?: string|null) {
    styleName = styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const styleMap = this._readStyleAttribute(element);
    styleMap[styleName] = styleValue || '';
    this._writeStyleAttribute(element, styleMap);
  }
  removeStyle(element: any, styleName: string) {
    // IE requires '' instead of null
    // see https://github.com/angular/angular/issues/7916
    this.setStyle(element, styleName, '');
  }
  getStyle(element: any, styleName: string): string {
    const styleMap = this._readStyleAttribute(element);
    return styleMap[styleName] || '';
  }
  hasStyle(element: any, styleName: string, styleValue?: string): boolean {
    const value = this.getStyle(element, styleName);
    return styleValue ? value == styleValue : value.length > 0;
  }

  dispatchEvent(el: Node, evt: any) {
    el.dispatchEvent(evt);

    // Dispatch the event to the window also.
    const doc = el.ownerDocument || el;
    const win = (doc as any).defaultView;
    if (win) {
      win.dispatchEvent(evt);
    }
  }

  getHistory(): History { throw _notImplemented('getHistory'); }
  getLocation(): Location { throw _notImplemented('getLocation'); }
  getUserAgent(): string { return 'Fake user agent'; }

  supportsWebAnimation(): boolean { return false; }
  performanceNow(): number { return Date.now(); }
  getAnimationPrefix(): string { return ''; }
  getTransitionEnd(): string { return 'transitionend'; }
  supportsAnimation(): boolean { return true; }

  getDistributedNodes(el: any): Node[] { throw _notImplemented('getDistributedNodes'); }

  supportsCookies(): boolean { return false; }
  getCookie(name: string): string { throw _notImplemented('getCookie'); }
  setCookie(name: string, value: string) { throw _notImplemented('setCookie'); }
}
