/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵparseCookieValue as parseCookieValue,
  ɵsetRootDomAdapter as setRootDomAdapter,
  ɵDomAdapter as DomAdapter,
} from '@angular/common';

/**
 * A `DomAdapter` powered by full browser DOM APIs.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export class BrowserDomAdapter extends DomAdapter {
  override readonly supportsDOMEvents: boolean = true;

  static makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }

  override onAndCancel(el: Node, evt: any, listener: any, options: any): Function {
    el.addEventListener(evt, listener, options);
    return () => {
      el.removeEventListener(evt, listener, options);
    };
  }
  override dispatchEvent(el: Node, evt: any) {
    el.dispatchEvent(evt);
  }
  override remove(node: Node): void {
    (node as Element | Text | Comment).remove();
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
  override getGlobalEventTarget(doc: Document, target: string): EventTarget | null {
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
  override getBaseHref(doc: Document): string | null {
    const href = getBaseElementHref();
    return href == null ? null : relativePath(href);
  }
  override resetBaseElement(): void {
    baseElement = null;
  }
  override getUserAgent(): string {
    return window.navigator.userAgent;
  }
  override getCookie(name: string): string | null {
    return parseCookieValue(document.cookie, name);
  }
}

let baseElement: HTMLElement | null = null;
function getBaseElementHref(): string | null {
  baseElement = baseElement || document.head.querySelector('base');
  return baseElement ? baseElement.getAttribute('href') : null;
}

function relativePath(url: string): string {
  // The base URL doesn't really matter, we just need it so relative paths have something
  // to resolve against. In the browser `HTMLBaseElement.href` is always absolute.
  return new URL(url, document.baseURI).pathname;
}
