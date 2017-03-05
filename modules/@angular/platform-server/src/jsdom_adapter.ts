/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const jsdom = require('jsdom');

import {ɵBrowserDomAdapter as BrowserDomAdapter, ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/platform-browser';

const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const ELEMENT_NODE = 1;

function _notImplemented(methodName: string) {
  return new Error('This method is not implemented in JsDomAdapter: ' + methodName);
}

/**
 * Parses a document string to a Document object.
 */
export function parseDocument(html: string) {
  return jsdom.jsdom(html);
}

/**
 * Serializes a document to string.
 */
export function serializeDocument(doc: Document): string {
  return jsdom.serializeDocument(doc);
}

export class JsDomAdapter extends BrowserDomAdapter {
  static makeCurrent() { setRootDomAdapter(new JsDomAdapter()); }

  logError(error: string) { console.error(error); }

  // tslint:disable-next-line:no-console
  log(error: string) { console.log(error); }

  logGroup(error: string) { console.error(error); }

  logGroupEnd() {}

  supportsDOMEvents(): boolean { return false; }
  supportsNativeShadowDOM(): boolean { return false; }

  createHtmlDocument(): HTMLDocument {
    return jsdom.jsdom('<html><head><title>fakeTitle</title></head><body></body></html>');
  }

  createShadowRoot(doc: Document, el: any): HTMLElement {
    el.shadowRoot = doc.createDocumentFragment();
    el.shadowRoot.parent = el;
    return el.shadowRoot;
  }
  getShadowRoot(el: any): Element { return el.shadowRoot; }

  isTextNode(node: any): boolean { return node.nodeType === TEXT_NODE; }
  isCommentNode(node: any): boolean { return node.nodeType === COMMENT_NODE; }
  isElementNode(node: any): boolean { return node ? node.nodeType === ELEMENT_NODE : false; }
  hasShadowRoot(node: any): boolean { return node.shadowRoot != null; }
  isShadowRoot(node: any): boolean { return this.getShadowRoot(node) == node; }

  getGlobalEventTarget(doc: Document, target: string): EventTarget {
    if (target === 'window') {
      return (<any>doc).defaultView;
    }
    if (target === 'document') {
      return doc;
    }
    if (target === 'body') {
      return doc.body;
    }
  }

  getBaseHref(doc: Document): string {
    const base = this.querySelector(doc.documentElement, 'base');
    let href = '';
    if (base) {
      href = this.getHref(base);
    }
    // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
    return href;
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