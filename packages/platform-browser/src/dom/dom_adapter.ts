/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

let _DOM: DomAdapter = null !;

export function getDOM() {
  return _DOM;
}

export function setDOM(adapter: DomAdapter) {
  _DOM = adapter;
}

export function setRootDomAdapter(adapter: DomAdapter) {
  if (!_DOM) {
    _DOM = adapter;
  }
}

/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export abstract class DomAdapter {
  public resourceLoaderType: Type<any> = null !;
  abstract hasProperty(element: any, name: string): boolean;
  abstract setProperty(el: Element, name: string, value: any): any;
  abstract getProperty(el: Element, name: string): any;
  abstract invoke(el: Element, methodName: string, args: any[]): any;

  abstract logError(error: any): any;
  abstract log(error: any): any;
  abstract logGroup(error: any): any;
  abstract logGroupEnd(): any;

  /**
   * Maps attribute names to their corresponding property names for cases
   * where attribute name doesn't match property name.
   */
  get attrToPropMap(): {[key: string]: string} { return this._attrToPropMap; }
  set attrToPropMap(value: {[key: string]: string}) { this._attrToPropMap = value; }
  /** @internal */
  // TODO(issue/24571): remove '!'.
  _attrToPropMap !: {[key: string]: string};

  abstract contains(nodeA: any, nodeB: any): boolean;
  abstract parse(templateHtml: string): any;
  abstract querySelector(el: any, selector: string): any;
  abstract querySelectorAll(el: any, selector: string): any[];
  abstract on(el: any, evt: any, listener: any): any;
  abstract onAndCancel(el: any, evt: any, listener: any): Function;
  abstract dispatchEvent(el: any, evt: any): any;
  abstract createMouseEvent(eventType: any): any;
  abstract createEvent(eventType: string): any;
  abstract preventDefault(evt: any): any;
  abstract isPrevented(evt: any): boolean;
  abstract getInnerHTML(el: any): string;
  /** Returns content if el is a <template> element, null otherwise. */
  abstract getTemplateContent(el: any): any;
  abstract getOuterHTML(el: any): string;
  abstract nodeName(node: any): string;
  abstract nodeValue(node: any): string|null;
  abstract type(node: any): string;
  abstract content(node: any): any;
  abstract firstChild(el: any): Node|null;
  abstract nextSibling(el: any): Node|null;
  abstract parentElement(el: any): Node|null;
  abstract childNodes(el: any): Node[];
  abstract childNodesAsList(el: any): Node[];
  abstract clearNodes(el: any): any;
  abstract appendChild(el: any, node: any): any;
  abstract removeChild(el: any, node: any): any;
  abstract replaceChild(el: any, newNode: any, oldNode: any): any;
  abstract remove(el: any): Node;
  abstract insertBefore(parent: any, ref: any, node: any): any;
  abstract insertAllBefore(parent: any, ref: any, nodes: any): any;
  abstract insertAfter(parent: any, el: any, node: any): any;
  abstract setInnerHTML(el: any, value: any): any;
  abstract getText(el: any): string|null;
  abstract setText(el: any, value: string): any;
  abstract getValue(el: any): string;
  abstract setValue(el: any, value: string): any;
  abstract getChecked(el: any): boolean;
  abstract setChecked(el: any, value: boolean): any;
  abstract createComment(text: string): any;
  abstract createTemplate(html: any): HTMLElement;
  abstract createElement(tagName: any, doc?: any): HTMLElement;
  abstract createElementNS(ns: string, tagName: string, doc?: any): Element;
  abstract createTextNode(text: string, doc?: any): Text;
  abstract createScriptTag(attrName: string, attrValue: string, doc?: any): HTMLElement;
  abstract createStyleElement(css: string, doc?: any): HTMLStyleElement;
  abstract createShadowRoot(el: any): any;
  abstract getShadowRoot(el: any): any;
  abstract getHost(el: any): any;
  abstract getDistributedNodes(el: any): Node[];
  abstract clone /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/;
  abstract getElementsByClassName(element: any, name: string): HTMLElement[];
  abstract getElementsByTagName(element: any, name: string): HTMLElement[];
  abstract classList(element: any): any[];
  abstract addClass(element: any, className: string): any;
  abstract removeClass(element: any, className: string): any;
  abstract hasClass(element: any, className: string): boolean;
  abstract setStyle(element: any, styleName: string, styleValue: string): any;
  abstract removeStyle(element: any, styleName: string): any;
  abstract getStyle(element: any, styleName: string): string;
  abstract hasStyle(element: any, styleName: string, styleValue?: string): boolean;
  abstract tagName(element: any): string;
  abstract attributeMap(element: any): Map<string, string>;
  abstract hasAttribute(element: any, attribute: string): boolean;
  abstract hasAttributeNS(element: any, ns: string, attribute: string): boolean;
  abstract getAttribute(element: any, attribute: string): string|null;
  abstract getAttributeNS(element: any, ns: string, attribute: string): string|null;
  abstract setAttribute(element: any, name: string, value: string): any;
  abstract setAttributeNS(element: any, ns: string, name: string, value: string): any;
  abstract removeAttribute(element: any, attribute: string): any;
  abstract removeAttributeNS(element: any, ns: string, attribute: string): any;
  abstract templateAwareRoot(el: any): any;
  abstract createHtmlDocument(): HTMLDocument;
  abstract getDefaultDocument(): Document;
  abstract getBoundingClientRect(el: any): any;
  abstract getTitle(doc: Document): string;
  abstract setTitle(doc: Document, newTitle: string): any;
  abstract elementMatches(n: any, selector: string): boolean;
  abstract isTemplateElement(el: any): boolean;
  abstract isTextNode(node: any): boolean;
  abstract isCommentNode(node: any): boolean;
  abstract isElementNode(node: any): boolean;
  abstract hasShadowRoot(node: any): boolean;
  abstract isShadowRoot(node: any): boolean;
  abstract importIntoDoc /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/;
  abstract adoptNode /*<T extends Node>*/ (node: Node /*T*/): Node /*T*/;
  abstract getHref(element: any): string;
  abstract getEventKey(event: any): string;
  abstract resolveAndSetHref(element: any, baseUrl: string, href: string): any;
  abstract supportsDOMEvents(): boolean;
  abstract supportsNativeShadowDOM(): boolean;
  abstract getGlobalEventTarget(doc: Document, target: string): any;
  abstract getHistory(): History;
  abstract getLocation(): Location;
  abstract getBaseHref(doc: Document): string|null;
  abstract resetBaseElement(): void;
  abstract getUserAgent(): string;
  abstract setData(element: any, name: string, value: string): any;
  abstract getComputedStyle(element: any): any;
  abstract getData(element: any, name: string): string|null;
  abstract supportsWebAnimation(): boolean;
  abstract performanceNow(): number;
  abstract getAnimationPrefix(): string;
  abstract getTransitionEnd(): string;
  abstract supportsAnimation(): boolean;

  abstract supportsCookies(): boolean;
  abstract getCookie(name: string): string|null;
  abstract setCookie(name: string, value: string): any;
}
