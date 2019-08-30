/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵparseCookieValue as parseCookieValue, ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/common';
import {ɵglobal as global} from '@angular/core';

import {GenericBrowserDomAdapter} from './generic_browser_adapter';


const DOM_KEY_LOCATION_NUMPAD = 3;

// Map to convert some key or keyIdentifier values to what will be returned by getEventKey
const _keyMap: {[k: string]: string} = {
  // The following values are here for cross-browser compatibility and to match the W3C standard
  // cf http://www.w3.org/TR/DOM-Level-3-Events-key/
  '\b': 'Backspace',
  '\t': 'Tab',
  '\x7F': 'Delete',
  '\x1B': 'Escape',
  'Del': 'Delete',
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Down': 'ArrowDown',
  'Menu': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'Win': 'OS'
};

// There is a bug in Chrome for numeric keypad keys:
// https://code.google.com/p/chromium/issues/detail?id=155654
// 1, 2, 3 ... are reported as A, B, C ...
const _chromeNumKeyPadMap = {
  'A': '1',
  'B': '2',
  'C': '3',
  'D': '4',
  'E': '5',
  'F': '6',
  'G': '7',
  'H': '8',
  'I': '9',
  'J': '*',
  'K': '+',
  'M': '-',
  'N': '.',
  'O': '/',
  '\x60': '0',
  '\x90': 'NumLock'
};

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
  static makeCurrent() { setRootDomAdapter(new BrowserDomAdapter()); }
  getProperty(el: Node, name: string): any { return (<any>el)[name]; }

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

  querySelectorAll(el: any, selector: string): any[] { return el.querySelectorAll(selector); }
  onAndCancel(el: Node, evt: any, listener: any): Function {
    el.addEventListener(evt, listener, false);
    // Needed to follow Dart's subscription semantic, until fix of
    // https://code.google.com/p/dart/issues/detail?id=17406
    return () => { el.removeEventListener(evt, listener, false); };
  }
  dispatchEvent(el: Node, evt: any) { el.dispatchEvent(evt); }
  parentElement(el: Node): Node|null { return el.parentNode; }
  appendChild(el: Node, node: Node) { el.appendChild(node); }
  remove(node: Node): Node {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    return node;
  }
  getValue(el: any): string { return el.value; }
  createElement(tagName: string, doc?: Document): HTMLElement {
    doc = doc || this.getDefaultDocument();
    return doc.createElement(tagName);
  }
  getHost(el: HTMLElement): HTMLElement { return (<any>el).host; }
  getElementsByTagName(element: any, name: string): HTMLElement[] {
    return element.getElementsByTagName(name);
  }
  setStyle(element: any, styleName: string, styleValue: string) {
    element.style[styleName] = styleValue;
  }
  removeStyle(element: any, stylename: string) {
    // IE requires '' instead of null
    // see https://github.com/angular/angular/issues/7916
    element.style[stylename] = '';
  }

  getStyle(element: any, stylename: string): string { return element.style[stylename]; }

  getAttribute(element: Element, attribute: string): string|null {
    return element.getAttribute(attribute);
  }
  setAttribute(element: Element, name: string, value: string) { element.setAttribute(name, value); }

  createHtmlDocument(): HTMLDocument {
    return document.implementation.createHTMLDocument('fakeTitle');
  }
  getDefaultDocument(): Document { return document; }
  getTitle(doc: Document): string { return doc.title; }
  setTitle(doc: Document, newTitle: string) { doc.title = newTitle || ''; }
  elementMatches(n: any, selector: string): boolean {
    if (this.isElementNode(n)) {
      return n.matches && n.matches(selector) ||
          n.msMatchesSelector && n.msMatchesSelector(selector) ||
          n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
    }

    return false;
  }

  isElementNode(node: Node): boolean { return node.nodeType === Node.ELEMENT_NODE; }

  isShadowRoot(node: any): boolean { return node instanceof DocumentFragment; }

  getEventKey(event: any): string {
    let key = event.key;
    if (key == null) {
      key = event.keyIdentifier;
      // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
      // Safari cf
      // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
      if (key == null) {
        return 'Unidentified';
      }
      if (key.startsWith('U+')) {
        key = String.fromCharCode(parseInt(key.substring(2), 16));
        if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
          // There is a bug in Chrome for numeric keypad keys:
          // https://code.google.com/p/chromium/issues/detail?id=155654
          // 1, 2, 3 ... are reported as A, B, C ...
          key = (_chromeNumKeyPadMap as any)[key];
        }
      }
    }

    return _keyMap[key] || key;
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
  getHistory(): History { return window.history; }
  getLocation(): Location { return window.location; }
  getBaseHref(doc: Document): string|null {
    const href = getBaseElementHref();
    return href == null ? null : relativePath(href);
  }
  resetBaseElement(): void { baseElement = null; }
  getUserAgent(): string { return window.navigator.userAgent; }
  performanceNow(): number {
    // performance.now() is not available in all browsers, see
    // http://caniuse.com/#search=performance.now
    return window.performance && window.performance.now ? window.performance.now() :
                                                          new Date().getTime();
  }

  supportsCookies(): boolean { return true; }

  getCookie(name: string): string|null { return parseCookieValue(document.cookie, name); }
}

let baseElement: HTMLElement|null = null;
function getBaseElementHref(): string|null {
  if (!baseElement) {
    baseElement = document.querySelector('base') !;
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
