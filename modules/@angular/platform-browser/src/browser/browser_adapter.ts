/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setRootDomAdapter} from '../dom/dom_adapter';
import {global, isBlank, isPresent, setValueOnPath} from '../facade/lang';
import {GenericBrowserDomAdapter} from './generic_browser_adapter';

const _attrToPropMap = {
  'class': 'className',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};

/**
 * Normalization of deprecated HTML5 `key` values.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
const _normalizeKey: {[key: string]: string} = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified',
};

/**
 * Translation from legacy `keyCode` to HTML5 `key`.
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
const _keyCodeDictionary: {[keyCode: number]: string} = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta',
};

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
    return evt.defaultPrevented || isPresent(evt.returnValue) && !evt.returnValue;
  }
  getInnerHTML(el: HTMLElement): string { return el.innerHTML; }
  getTemplateContent(el: Node): Node {
    return 'content' in el && el instanceof HTMLTemplateElement ? el.content : null;
  }
  getOuterHTML(el: HTMLElement): string { return el.outerHTML; }
  nodeName(node: Node): string { return node.nodeName; }
  nodeValue(node: Node): string { return node.nodeValue; }
  type(node: HTMLInputElement): string { return node.type; }
  content(node: Node): Node {
    if (this.hasProperty(node, 'content')) {
      return (<any>node).content;
    } else {
      return node;
    }
  }
  firstChild(el: Node): Node { return el.firstChild; }
  nextSibling(el: Node): Node { return el.nextSibling; }
  parentElement(el: Node): Node { return el.parentNode; }
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
  getText(el: Node): string { return el.textContent; }
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
  hasStyle(element: any, styleName: string, styleValue: string = null): boolean {
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
  getAttribute(element: Element, attribute: string): string {
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
    return isPresent(node.shadowRoot) && node instanceof HTMLElement;
  }
  isShadowRoot(node: any): boolean { return node instanceof DocumentFragment; }
  importIntoDoc(node: Node): any { return document.importNode(this.templateAwareRoot(node), true); }
  adoptNode(node: Node): any { return document.adoptNode(node); }
  getHref(el: Element): string { return (<any>el).href; }

  /**
   * @param {any} event Native browser event.
   * @return {string} Normalized `key` property.
   */
  getEventKey(event: any): string {
    if (event.key) {
      // Normalize inconsistent values reported by browsers due to
      // implementations of a working draft specification.

      // FireFox implements `key` but returns `MozPrintableKey` for all
      // printable characters (normalized to `Unidentified`), ignore it.
      const key: string = _normalizeKey[event.key] || event.key;
      if (key !== 'Unidentified') {
        return key;
      }
    }

    // Browser does not implement `key`, polyfill as much of it as we can.
    if (event.type === 'keypress') {
      const charCode: number = getEventCharCode(event);

      // The enter-key is technically both printable and non-printable and can
      // thus be captured by `keypress`, no other non-printable key should.
      return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      // While user keyboard layout determines the actual meaning of each
      // `keyCode` value, almost all function keys have a universal value.
      return _keyCodeDictionary[event.keyCode] || 'Unidentified';
    }
    return '';
  }
  getGlobalEventTarget(doc: Document, target: string): EventTarget {
    if (target === 'window') {
      return window;
    }
    if (target === 'document') {
      return document;
    }
    if (target === 'body') {
      return document.body;
    }
  }
  getHistory(): History { return window.history; }
  getLocation(): Location { return window.location; }
  getBaseHref(doc: Document): string {
    const href = getBaseElementHref();
    return isBlank(href) ? null : relativePath(href);
  }
  resetBaseElement(): void { baseElement = null; }
  getUserAgent(): string { return window.navigator.userAgent; }
  setData(element: Element, name: string, value: string) {
    this.setAttribute(element, 'data-' + name, value);
  }
  getData(element: Element, name: string): string {
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

  getCookie(name: string): string { return parseCookieValue(document.cookie, name); }

  setCookie(name: string, value: string) {
    // document.cookie is magical, assigning into it assigns/overrides one cookie value, but does
    // not clear other cookies.
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  }
}

let baseElement: HTMLElement = null;
function getBaseElementHref(): string {
  if (!baseElement) {
    baseElement = document.querySelector('base');
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

export function parseCookieValue(cookieStr: string, name: string): string {
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

/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {KeyboardEvent} event Native browser event.
 * @return {number} Normalized `charCode` property.
 */
export function getEventCharCode(event: KeyboardEvent): number {
  let charCode: number;
  const keyCode: number = event.keyCode;

  if ('charCode' in event) {
    charCode = event.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    if (charCode === 0 && keyCode === 13) {
      charCode = 13;
    }
  } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    charCode = keyCode;
  }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
  if (charCode >= 32 || charCode === 13) {
    return charCode;
  }

  return 0;
}
