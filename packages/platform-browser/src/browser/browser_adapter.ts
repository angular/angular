/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵglobal as global} from '@angular/core';
import {setRootDomAdapter} from '../dom/dom_adapter';

import {GenericBrowserDomAdapter} from './generic_browser_adapter';

const _attrToPropMap = {
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};

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

let nodeContains: (a: any, b: any) => boolean;

if (global['Node']) {
  nodeContains = global['Node'].prototype.contains || function(node) {
    return !!(this.compareDocumentPosition(node) & 16);
  };
}

/**
 * A `DomAdapter` powered by full browser DOM APIs.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
/* tslint:disable:requireParameterType no-console */
export class BrowserDomAdapter extends GenericBrowserDomAdapter {
  parse(templateHtml: string) { throw new Error('parse not implemented'); }
  static makeCurrent() { setRootDomAdapter(new BrowserDomAdapter()); }
  hasProperty(element: Node, name: string): boolean { return name in element; }
  setProperty(el: Node, name: string, value: any) { (<any>el)[name] = value; }
  getProperty(el: Node, name: string): any { return (<any>el)[name]; }
  invoke(el: Node, methodName: string, args: any[]): any { (<any>el)[methodName](...args); }

  // TODO(tbosch): move this into a separate environment class once we have it
  logError(error: string): void {
    if (window.console) {
      if (console.error) {
        console.error(error);
      } else {
        console.log(error);
      }
    }
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

  get attrToPropMap(): any { return _attrToPropMap; }

  contains(nodeA: any, nodeB: any): boolean { return nodeContains.call(nodeA, nodeB); }
  querySelector(el: Element, selector: string): any { return el.querySelector(selector); }
  querySelectorAll(el: any, selector: string): any[] { return el.querySelectorAll(selector); }
  on(el: Node, evt: any, listener: any) { el.addEventListener(evt, listener, false); }
  onAndCancel(el: Node, evt: any, listener: any): Function {
    el.addEventListener(evt, listener, false);
    // Needed to follow Dart's subscription semantic, until fix of
    // https://code.google.com/p/dart/issues/detail?id=17406
    return () => { el.removeEventListener(evt, listener, false); };
  }
  dispatchEvent(el: Node, evt: any) { el.dispatchEvent(evt); }
  createMouseEvent(eventType: string): MouseEvent {
    const evt: MouseEvent = document.createEvent('MouseEvent');
    evt.initEvent(eventType, true, true);
    return evt;
  }
  createEvent(eventType: any): Event {
    const evt: Event = document.createEvent('Event');
    evt.initEvent(eventType, true, true);
    return evt;
  }
  preventDefault(evt: Event) {
    evt.preventDefault();
    evt.returnValue = false;
  }
  isPrevented(evt: Event): boolean {
    return evt.defaultPrevented || evt.returnValue != null && !evt.returnValue;
  }
  getInnerHTML(el: HTMLElement): string { return el.innerHTML; }
  getTemplateContent(el: Node): Node|null {
    return 'content' in el && el instanceof HTMLTemplateElement ? el.content : null;
  }
  getOuterHTML(el: HTMLElement): string { return el.outerHTML; }
  nodeName(node: Node): string { return node.nodeName; }
  nodeValue(node: Node): string|null { return node.nodeValue; }
  type(node: HTMLInputElement): string { return node.type; }
  content(node: Node): Node {
    if (this.hasProperty(node, 'content')) {
      return (<any>node).content;
    } else {
      return node;
    }
  }
  firstChild(el: Node): Node|null { return el.firstChild; }
  nextSibling(el: Node): Node|null { return el.nextSibling; }
  parentElement(el: Node): Node|null { return el.parentNode; }
  childNodes(el: any): Node[] { return el.childNodes; }
  childNodesAsList(el: Node): any[] {
    const childNodes = el.childNodes;
    const res = new Array(childNodes.length);
    for (let i = 0; i < childNodes.length; i++) {
      res[i] = childNodes[i];
    }
    return res;
  }
  clearNodes(el: Node) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
  appendChild(el: Node, node: Node) { el.appendChild(node); }
  removeChild(el: Node, node: Node) { el.removeChild(node); }
  replaceChild(el: Node, newChild: Node, oldChild: Node) { el.replaceChild(newChild, oldChild); }
  remove(node: Node): Node {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    return node;
  }
  insertBefore(parent: Node, ref: Node, node: Node) { parent.insertBefore(node, ref); }
  insertAllBefore(parent: Node, ref: Node, nodes: Node[]) {
    nodes.forEach((n: any) => parent.insertBefore(n, ref));
  }
  insertAfter(parent: Node, ref: Node, node: any) { parent.insertBefore(node, ref.nextSibling); }
  setInnerHTML(el: Element, value: string) { el.innerHTML = value; }
  getText(el: Node): string|null { return el.textContent; }
  setText(el: Node, value: string) { el.textContent = value; }
  getValue(el: any): string { return el.value; }
  setValue(el: any, value: string) { el.value = value; }
  getChecked(el: any): boolean { return el.checked; }
  setChecked(el: any, value: boolean) { el.checked = value; }
  createComment(text: string): Comment { return document.createComment(text); }
  createTemplate(html: any): HTMLElement {
    const t = document.createElement('template');
    t.innerHTML = html;
    return t;
  }
  createElement(tagName: string, doc = document): HTMLElement { return doc.createElement(tagName); }
  createElementNS(ns: string, tagName: string, doc = document): Element {
    return doc.createElementNS(ns, tagName);
  }
  createTextNode(text: string, doc = document): Text { return doc.createTextNode(text); }
  createScriptTag(attrName: string, attrValue: string, doc = document): HTMLScriptElement {
    const el = <HTMLScriptElement>doc.createElement('SCRIPT');
    el.setAttribute(attrName, attrValue);
    return el;
  }
  createStyleElement(css: string, doc = document): HTMLStyleElement {
    const style = <HTMLStyleElement>doc.createElement('style');
    this.appendChild(style, this.createTextNode(css));
    return style;
  }
  createShadowRoot(el: HTMLElement): DocumentFragment { return (<any>el).createShadowRoot(); }
  getShadowRoot(el: HTMLElement): DocumentFragment { return (<any>el).shadowRoot; }
  getHost(el: HTMLElement): HTMLElement { return (<any>el).host; }
  clone(node: Node): Node { return node.cloneNode(true); }
  getElementsByClassName(element: any, name: string): HTMLElement[] {
    return element.getElementsByClassName(name);
  }
  getElementsByTagName(element: any, name: string): HTMLElement[] {
    return element.getElementsByTagName(name);
  }
  classList(element: any): any[] { return Array.prototype.slice.call(element.classList, 0); }
  addClass(element: any, className: string) { element.classList.add(className); }
  removeClass(element: any, className: string) { element.classList.remove(className); }
  hasClass(element: any, className: string): boolean {
    return element.classList.contains(className);
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
  hasStyle(element: any, styleName: string, styleValue?: string|null): boolean {
    const value = this.getStyle(element, styleName) || '';
    return styleValue ? value == styleValue : value.length > 0;
  }
  tagName(element: any): string { return element.tagName; }
  attributeMap(element: any): Map<string, string> {
    const res = new Map<string, string>();
    const elAttrs = element.attributes;
    for (let i = 0; i < elAttrs.length; i++) {
      const attrib = elAttrs[i];
      res.set(attrib.name, attrib.value);
    }
    return res;
  }
  hasAttribute(element: Element, attribute: string): boolean {
    return element.hasAttribute(attribute);
  }
  hasAttributeNS(element: Element, ns: string, attribute: string): boolean {
    return element.hasAttributeNS(ns, attribute);
  }
  getAttribute(element: Element, attribute: string): string|null {
    return element.getAttribute(attribute);
  }
  getAttributeNS(element: Element, ns: string, name: string): string {
    return element.getAttributeNS(ns, name);
  }
  setAttribute(element: Element, name: string, value: string) { element.setAttribute(name, value); }
  setAttributeNS(element: Element, ns: string, name: string, value: string) {
    element.setAttributeNS(ns, name, value);
  }
  removeAttribute(element: Element, attribute: string) { element.removeAttribute(attribute); }
  removeAttributeNS(element: Element, ns: string, name: string) {
    element.removeAttributeNS(ns, name);
  }
  templateAwareRoot(el: Node): any { return this.isTemplateElement(el) ? this.content(el) : el; }
  createHtmlDocument(): HTMLDocument {
    return document.implementation.createHTMLDocument('fakeTitle');
  }
  getBoundingClientRect(el: Element): any {
    try {
      return el.getBoundingClientRect();
    } catch (e) {
      return {top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0};
    }
  }
  getTitle(doc: Document): string { return document.title; }
  setTitle(doc: Document, newTitle: string) { document.title = newTitle || ''; }
  elementMatches(n: any, selector: string): boolean {
    if (n instanceof HTMLElement) {
      return n.matches && n.matches(selector) ||
          n.msMatchesSelector && n.msMatchesSelector(selector) ||
          n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
    }

    return false;
  }
  isTemplateElement(el: Node): boolean {
    return el instanceof HTMLElement && el.nodeName == 'TEMPLATE';
  }
  isTextNode(node: Node): boolean { return node.nodeType === Node.TEXT_NODE; }
  isCommentNode(node: Node): boolean { return node.nodeType === Node.COMMENT_NODE; }
  isElementNode(node: Node): boolean { return node.nodeType === Node.ELEMENT_NODE; }
  hasShadowRoot(node: any): boolean {
    return node.shadowRoot != null && node instanceof HTMLElement;
  }
  isShadowRoot(node: any): boolean { return node instanceof DocumentFragment; }
  importIntoDoc(node: Node): any { return document.importNode(this.templateAwareRoot(node), true); }
  adoptNode(node: Node): any { return document.adoptNode(node); }
  getHref(el: Element): string { return (<any>el).href; }

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
      return document;
    }
    if (target === 'body') {
      return document.body;
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
  setData(element: Element, name: string, value: string) {
    this.setAttribute(element, 'data-' + name, value);
  }
  getData(element: Element, name: string): string|null {
    return this.getAttribute(element, 'data-' + name);
  }
  getComputedStyle(element: any): any { return getComputedStyle(element); }
  // TODO(tbosch): move this into a separate environment class once we have it
  setGlobalVar(path: string, value: any) { setValueOnPath(global, path, value); }
  supportsWebAnimation(): boolean {
    return typeof(<any>Element).prototype['animate'] === 'function';
  }
  performanceNow(): number {
    // performance.now() is not available in all browsers, see
    // http://caniuse.com/#search=performance.now
    return window.performance && window.performance.now ? window.performance.now() :
                                                          new Date().getTime();
  }

  supportsCookies(): boolean { return true; }

  getCookie(name: string): string|null { return parseCookieValue(document.cookie, name); }

  setCookie(name: string, value: string) {
    // document.cookie is magical, assigning into it assigns/overrides one cookie value, but does
    // not clear other cookies.
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  }
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

export function parseCookieValue(cookieStr: string, name: string): string|null {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(';')) {
    const eqIndex = cookie.indexOf('=');
    const [cookieName, cookieValue]: string[] =
        eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function setValueOnPath(global: any, path: string, value: any) {
  const parts = path.split('.');
  let obj: any = global;
  while (parts.length > 1) {
    const name = parts.shift() !;
    if (obj.hasOwnProperty(name) && obj[name] != null) {
      obj = obj[name];
    } else {
      obj = obj[name] = {};
    }
  }
  if (obj === undefined || obj === null) {
    obj = {};
  }
  obj[parts.shift() !] = value;
}
