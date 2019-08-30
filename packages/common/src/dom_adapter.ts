/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let _DOM: DomAdapter = null !;

export function getDOM(): DomAdapter {
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
  // Needs Domino-friendly test utility
  abstract getProperty(el: Element, name: string): any;
  abstract dispatchEvent(el: any, evt: any): any;

  // Used by router
  abstract log(error: any): any;
  abstract logGroup(error: any): any;
  abstract logGroupEnd(): any;

  // Used by Meta
  abstract querySelectorAll(el: any, selector: string): any[];
  abstract remove(el: any): Node;
  abstract getAttribute(element: any, attribute: string): string|null;
  abstract appendChild(el: any, node: any): any;
  abstract createElement(tagName: any, doc?: any): HTMLElement;
  abstract setAttribute(element: any, name: string, value: string): any;
  abstract getElementsByTagName(element: any, name: string): HTMLElement[];
  abstract createHtmlDocument(): HTMLDocument;
  abstract getDefaultDocument(): Document;

  // Used by platform-server
  abstract getStyle(element: any, styleName: string): any;
  abstract setStyle(element: any, styleName: string, styleValue: string): any;
  abstract removeStyle(element: any, styleName: string): any;

  // Used by Title
  abstract getTitle(doc: Document): string;
  abstract setTitle(doc: Document, newTitle: string): any;

  // Used by By.css
  abstract elementMatches(n: any, selector: string): boolean;
  abstract isElementNode(node: any): boolean;

  // Used by Testability
  abstract parentElement(el: any): Node|null;
  abstract isShadowRoot(node: any): boolean;
  abstract getHost(el: any): any;

  // Used by KeyEventsPlugin
  abstract onAndCancel(el: any, evt: any, listener: any): Function;
  abstract getEventKey(event: any): string;
  abstract supportsDOMEvents(): boolean;

  // Used by PlatformLocation and ServerEventManagerPlugin
  abstract getGlobalEventTarget(doc: Document, target: string): any;

  // Used by PlatformLocation
  abstract getHistory(): History;
  abstract getLocation():
      any; /** This is the ambient Location definition, NOT Location from @angular/common.  */
  abstract getBaseHref(doc: Document): string|null;
  abstract resetBaseElement(): void;

  // TODO: remove dependency in DefaultValueAccessor
  abstract getUserAgent(): string;

  // Used by AngularProfiler
  abstract performanceNow(): number;

  // Used by CookieXSRFStrategy
  abstract supportsCookies(): boolean;
  abstract getCookie(name: string): string|null;
}
