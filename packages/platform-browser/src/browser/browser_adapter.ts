/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵparseCookieValue as parseCookieValue, ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/common';
import {ɵglobal as global} from '@angular/core';

import {GenericBrowserDomAdapter} from './generic_browser_adapter';

const nodeContains: (this: Node, other: Node) => boolean = (() => {
  if (global['Node']) {
    return global['Node'].prototype.contains || function(this: Node, node: any) {
      return !!(this.compareDocumentPosition(node) & 16);
    };
  }

  return undefined as any;
})();

/**
 * A `DomAdapter` powered by full browser DOM APIs.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
/* tslint:disable:requireParameterType no-console */
export class BrowserDomAdapter extends GenericBrowserDomAdapter {
  static makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }
  getProperty(el: Node, name: string): any {
    return (<any>el)[name];
  }

  log(error: string): void {
    if (window.console) {
      window.console.log && window.console.log(error);
    }
  }

  logGroup(error: string): void {
    if (window.console) {
      window.console.group && window.console.group(error);
    }
  }

  logGroupEnd(): void {
    if (window.console) {
      window.console.groupEnd && window.console.groupEnd();
    }
  }

  onAndCancel(el: Node, evt: any, listener: any): Function {
    el.addEventListener(evt, listener, false);
    // Needed to follow Dart's subscription semantic, until fix of
    // https://code.google.com/p/dart/issues/detail?id=17406
    return () => {
      el.removeEventListener(evt, listener, false);
    };
  }
  dispatchEvent(el: Node, evt: any) {
    el.dispatchEvent(evt);
  }
  remove(node: Node): Node {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    return node;
  }
  getValue(el: any): string {
    return el.value;
  }
  createElement(tagName: string, doc?: Document): HTMLElement {
    doc = doc || this.getDefaultDocument();
    return doc.createElement(tagName);
  }
  createHtmlDocument(): HTMLDocument {
    return document.implementation.createHTMLDocument('fakeTitle');
  }
  getDefaultDocument(): Document {
    return document;
  }

  isElementNode(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  isShadowRoot(node: any): boolean {
    return node instanceof DocumentFragment;
  }

  getGlobalEventTarget(doc: Document, target: string): EventTarget|null {
    if (target === 'window') {
      return window;
    }
    if (target === 'document') {
      return doc;
    }
    if (target === 'body') {
      return doc.body;
    }
    return null;
  }
  getHistory(): History {
    return window.history;
  }
  getLocation(): Location {
    return window.location;
  }
  getBaseHref(doc: Document): string|null {
    const href = getBaseElementHref();
    return href == null ? null : relativePath(href);
  }
  resetBaseElement(): void {
    baseElement = null;
  }
  getUserAgent(): string {
    return window.navigator.userAgent;
  }
  performanceNow(): number {
    // performance.now() is not available in all browsers, see
    // https://caniuse.com/high-resolution-time
    return window.performance && window.performance.now ? window.performance.now() :
                                                          new Date().getTime();
  }

  supportsCookies(): boolean {
    return true;
  }

  getCookie(name: string): string|null {
    return parseCookieValue(document.cookie, name);
  }
}

let baseElement: HTMLElement|null = null;
function getBaseElementHref(): string|null {
  if (!baseElement) {
    baseElement = document.querySelector('base')!;
    if (!baseElement) {
      return null;
    }
  }
  return baseElement.getAttribute('href');
}

// based on urlUtils.js in AngularJS 1
let urlParsingNode: any;
function relativePath(url: any): string {
  if (!urlParsingNode) {
    urlParsingNode = document.createElement('a');
  }
  urlParsingNode.setAttribute('href', url);
  return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
                                                       '/' + urlParsingNode.pathname;
}
