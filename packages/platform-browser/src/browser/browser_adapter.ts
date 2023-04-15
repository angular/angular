/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵparseCookieValue as parseCookieValue, ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/common';

import {GenericBrowserDomAdapter} from './generic_browser_adapter';

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

  override onAndCancel(el: Node, evt: any, listener: any): Function {
    el.addEventListener(evt, listener);
    return () => {
      el.removeEventListener(evt, listener);
    };
  }
  override dispatchEvent(el: Node, evt: any) {
    el.dispatchEvent(evt);
  }
  override remove(node: Node): void {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  override createElement(tagName: string, doc?: Document): HTMLElement {
    doc = doc || this.getDefaultDocument();
    return doc.createElement(tagName);
  }
  override createHtmlDocument(): Document {
    return document.implementation.createHTMLDocument('fakeTitle');
  }
  override getDefaultDocument(): Document {
    return document;
  }

  override isElementNode(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  override isShadowRoot(node: any): boolean {
    return node instanceof DocumentFragment;
  }

  /** @deprecated No longer being used in Ivy code. To be removed in version 14. */
  override getGlobalEventTarget(doc: Document, target: string): EventTarget|null {
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
  override getBaseHref(doc: Document): string|null {
    const href = getBaseElementHref();
    return href == null ? null : relativePath(href);
  }
  override resetBaseElement(): void {
    baseElement = null;
  }
  override getUserAgent(): string {
    return window.navigator.userAgent;
  }
  override getCookie(name: string): string|null {
    return parseCookieValue(document.cookie, name);
  }
}

let baseElement: HTMLElement|null = null;
function getBaseElementHref(): string|null {
  baseElement = baseElement || document.querySelector('base');
  return baseElement ? baseElement.getAttribute('href') : null;
}

// based on urlUtils.js in AngularJS 1
let urlParsingNode: HTMLAnchorElement|undefined;
function relativePath(url: any): string {
  urlParsingNode = urlParsingNode || document.createElement('a');
  urlParsingNode.setAttribute('href', url);
  const pathName = urlParsingNode.pathname;
  return pathName.charAt(0) === '/' ? pathName : `/${pathName}`;
}
