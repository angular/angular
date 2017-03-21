/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵDomAdapter as DomAdapter, ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/platform-browser';

/**
 * This adapter is required to log error messages.
 *
 * Note: other methods all throw as the DOM is not accessible directly in web worker context.
 */
export class WorkerDomAdapter extends DomAdapter {
  static makeCurrent() { setRootDomAdapter(new WorkerDomAdapter()); }

  logError(error: any) {
    if (console.error) {
      console.error(error);
    } else {
      // tslint:disable-next-line:no-console
      console.log(error);
    }
  }

  // tslint:disable-next-line:no-console
  log(error: any) { console.log(error); }

  logGroup(error: any) {
    if (console.group) {
      console.group(error);
      this.logError(error);
    } else {
      // tslint:disable-next-line:no-console
      console.log(error);
    }
  }

  logGroupEnd() {
    if (console.groupEnd) {
      console.groupEnd();
    }
  }

  contains(nodeA: any, nodeB: any): boolean { throw 'not implemented'; }
  hasProperty(element: any, name: string): boolean { throw 'not implemented'; }
  setProperty(el: Element, name: string, value: any) { throw 'not implemented'; }
  getProperty(el: Element, name: string): any { throw 'not implemented'; }
  invoke(el: Element, methodName: string, args: any[]): any { throw 'not implemented'; }

  get attrToPropMap(): {[key: string]: string} { throw 'not implemented'; }
  set attrToPropMap(value: {[key: string]: string}) { throw 'not implemented'; }

  parse(templateHtml: string) { throw 'not implemented'; }
  querySelector(el: any, selector: string): HTMLElement { throw 'not implemented'; }
  querySelectorAll(el: any, selector: string): any[] { throw 'not implemented'; }
  on(el: any, evt: any, listener: any) { throw 'not implemented'; }
  onAndCancel(el: any, evt: any, listener: any): Function { throw 'not implemented'; }
  dispatchEvent(el: any, evt: any) { throw 'not implemented'; }
  createMouseEvent(eventType: any): any { throw 'not implemented'; }
  createEvent(eventType: string): any { throw 'not implemented'; }
  preventDefault(evt: any) { throw 'not implemented'; }
  isPrevented(evt: any): boolean { throw 'not implemented'; }
  getInnerHTML(el: any): string { throw 'not implemented'; }
  getTemplateContent(el: any): any { throw 'not implemented'; }
  getOuterHTML(el: any): string { throw 'not implemented'; }
  nodeName(node: any): string { throw 'not implemented'; }
  nodeValue(node: any): string { throw 'not implemented'; }
  type(node: any): string { throw 'not implemented'; }
  content(node: any): any { throw 'not implemented'; }
  firstChild(el: any): Node { throw 'not implemented'; }
  nextSibling(el: any): Node { throw 'not implemented'; }
  parentElement(el: any): Node { throw 'not implemented'; }
  childNodes(el: any): Node[] { throw 'not implemented'; }
  childNodesAsList(el: any): Node[] { throw 'not implemented'; }
  clearNodes(el: any) { throw 'not implemented'; }
  appendChild(el: any, node: any) { throw 'not implemented'; }
  removeChild(el: any, node: any) { throw 'not implemented'; }
  replaceChild(el: any, newNode: any, oldNode: any) { throw 'not implemented'; }
  remove(el: any): Node { throw 'not implemented'; }
  insertBefore(parent: any, el: any, node: any) { throw 'not implemented'; }
  insertAllBefore(parent: any, el: any, nodes: any) { throw 'not implemented'; }
  insertAfter(parent: any, el: any, node: any) { throw 'not implemented'; }
  setInnerHTML(el: any, value: any) { throw 'not implemented'; }
  getText(el: any): string { throw 'not implemented'; }
  setText(el: any, value: string) { throw 'not implemented'; }
  getValue(el: any): string { throw 'not implemented'; }
  setValue(el: any, value: string) { throw 'not implemented'; }
  getChecked(el: any): boolean { throw 'not implemented'; }
  setChecked(el: any, value: boolean) { throw 'not implemented'; }
  createComment(text: string): any { throw 'not implemented'; }
  createTemplate(html: any): HTMLElement { throw 'not implemented'; }
  createElement(tagName: any, doc?: any): HTMLElement { throw 'not implemented'; }
  createElementNS(ns: string, tagName: string, doc?: any): Element { throw 'not implemented'; }
  createTextNode(text: string, doc?: any): Text { throw 'not implemented'; }
  createScriptTag(attrName: string, attrValue: string, doc?: any): HTMLElement {
    throw 'not implemented';
  }
  createStyleElement(css: string, doc?: any): HTMLStyleElement { throw 'not implemented'; }
  createShadowRoot(el: any): any { throw 'not implemented'; }
  getShadowRoot(el: any): any { throw 'not implemented'; }
  getHost(el: any): any { throw 'not implemented'; }
  getDistributedNodes(el: any): Node[] { throw 'not implemented'; }
  clone(node: Node): Node { throw 'not implemented'; }
  getElementsByClassName(element: any, name: string): HTMLElement[] { throw 'not implemented'; }
  getElementsByTagName(element: any, name: string): HTMLElement[] { throw 'not implemented'; }
  classList(element: any): any[] { throw 'not implemented'; }
  addClass(element: any, className: string) { throw 'not implemented'; }
  removeClass(element: any, className: string) { throw 'not implemented'; }
  hasClass(element: any, className: string): boolean { throw 'not implemented'; }
  setStyle(element: any, styleName: string, styleValue: string) { throw 'not implemented'; }
  removeStyle(element: any, styleName: string) { throw 'not implemented'; }
  getStyle(element: any, styleName: string): string { throw 'not implemented'; }
  hasStyle(element: any, styleName: string, styleValue?: string): boolean {
    throw 'not implemented';
  }
  tagName(element: any): string { throw 'not implemented'; }
  attributeMap(element: any): Map<string, string> { throw 'not implemented'; }
  hasAttribute(element: any, attribute: string): boolean { throw 'not implemented'; }
  hasAttributeNS(element: any, ns: string, attribute: string): boolean { throw 'not implemented'; }
  getAttribute(element: any, attribute: string): string { throw 'not implemented'; }
  getAttributeNS(element: any, ns: string, attribute: string): string { throw 'not implemented'; }
  setAttribute(element: any, name: string, value: string) { throw 'not implemented'; }
  setAttributeNS(element: any, ns: string, name: string, value: string) { throw 'not implemented'; }
  removeAttribute(element: any, attribute: string) { throw 'not implemented'; }
  removeAttributeNS(element: any, ns: string, attribute: string) { throw 'not implemented'; }
  templateAwareRoot(el: any) { throw 'not implemented'; }
  createHtmlDocument(): HTMLDocument { throw 'not implemented'; }
  getBoundingClientRect(el: any) { throw 'not implemented'; }
  getTitle(doc: Document): string { throw 'not implemented'; }
  setTitle(doc: Document, newTitle: string) { throw 'not implemented'; }
  elementMatches(n: any, selector: string): boolean { throw 'not implemented'; }
  isTemplateElement(el: any): boolean { throw 'not implemented'; }
  isTextNode(node: any): boolean { throw 'not implemented'; }
  isCommentNode(node: any): boolean { throw 'not implemented'; }
  isElementNode(node: any): boolean { throw 'not implemented'; }
  hasShadowRoot(node: any): boolean { throw 'not implemented'; }
  isShadowRoot(node: any): boolean { throw 'not implemented'; }
  importIntoDoc(node: Node): Node { throw 'not implemented'; }
  adoptNode(node: Node): Node { throw 'not implemented'; }
  getHref(element: any): string { throw 'not implemented'; }
  getEventKey(event: any): string { throw 'not implemented'; }
  resolveAndSetHref(element: any, baseUrl: string, href: string) { throw 'not implemented'; }
  supportsDOMEvents(): boolean { throw 'not implemented'; }
  supportsNativeShadowDOM(): boolean { throw 'not implemented'; }
  getGlobalEventTarget(doc: Document, target: string): any { throw 'not implemented'; }
  getHistory(): History { throw 'not implemented'; }
  getLocation(): Location { throw 'not implemented'; }
  getBaseHref(doc: Document): string { throw 'not implemented'; }
  resetBaseElement(): void { throw 'not implemented'; }
  getUserAgent(): string { return 'Fake user agent'; }
  setData(element: any, name: string, value: string) { throw 'not implemented'; }
  getComputedStyle(element: any): any { throw 'not implemented'; }
  getData(element: any, name: string): string { throw 'not implemented'; }
  setGlobalVar(name: string, value: any) { throw 'not implemented'; }
  performanceNow(): number { throw 'not implemented'; }
  getAnimationPrefix(): string { throw 'not implemented'; }
  getTransitionEnd(): string { throw 'not implemented'; }
  supportsAnimation(): boolean { throw 'not implemented'; }
  supportsWebAnimation(): boolean { throw 'not implemented'; }

  supportsCookies(): boolean { return false; }
  getCookie(name: string): string { throw 'not implemented'; }
  setCookie(name: string, value: string) { throw 'not implemented'; }
}
