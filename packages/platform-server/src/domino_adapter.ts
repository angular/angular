/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const domino = require('domino');

import {ɵBrowserDomAdapter as BrowserDomAdapter} from '@angular/platform-browser';
import {ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/common';

function _notImplemented(methodName: string) {
  return new Error('This method is not implemented in DominoAdapter: ' + methodName);
}

export function setDomTypes() {
  // Make all Domino types available in the global env.
  Object.assign(global, domino.impl);
  (global as any)['KeyboardEvent'] = domino.impl.Event;
}

/**
 * Parses a document string to a Document object.
 */
export function parseDocument(html: string, url = '/') {
  let window = domino.createWindow(html, url);
  let doc = window.document;
  return doc;
}

/**
 * Serializes a document to string.
 */
export function serializeDocument(doc: Document): string {
  return (doc as any).serialize();
}

/**
 * DOM Adapter for the server platform based on https://github.com/fgnass/domino.
 */
export class DominoAdapter extends BrowserDomAdapter {
  static makeCurrent() {
    setDomTypes();
    setRootDomAdapter(new DominoAdapter());
  }

  private static defaultDoc: Document;

  log(error: string) {
    // tslint:disable-next-line:no-console
    console.log(error);
  }

  logGroup(error: string) {
    console.error(error);
  }

  logGroupEnd() {}

  supportsDOMEvents(): boolean {
    return false;
  }

  createHtmlDocument(): HTMLDocument {
    return parseDocument('<html><head><title>fakeTitle</title></head><body></body></html>');
  }

  getDefaultDocument(): Document {
    if (!DominoAdapter.defaultDoc) {
      DominoAdapter.defaultDoc = domino.createDocument();
    }
    return DominoAdapter.defaultDoc;
  }

  isElementNode(node: any): boolean {
    return node ? node.nodeType === DominoAdapter.defaultDoc.ELEMENT_NODE : false;
  }
  isShadowRoot(node: any): boolean {
    return node.shadowRoot == node;
  }

  getProperty(el: Element, name: string): any {
    if (name === 'href') {
      // Domino tries to resolve href-s which we do not want. Just return the
      // attribute value.
      return el.getAttribute('href');
    } else if (name === 'innerText') {
      // Domino does not support innerText. Just map it to textContent.
      return el.textContent;
    }
    return (<any>el)[name];
  }

  getGlobalEventTarget(doc: Document, target: string): EventTarget|null {
    if (target === 'window') {
      return doc.defaultView;
    }
    if (target === 'document') {
      return doc;
    }
    if (target === 'body') {
      return doc.body;
    }
    return null;
  }

  getBaseHref(doc: Document): string {
    const base = doc.documentElement!.querySelector('base');
    let href = '';
    if (base) {
      href = base.getAttribute('href')!;
    }
    // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
    return href;
  }

  dispatchEvent(el: Node, evt: any) {
    el.dispatchEvent(evt);

    // Dispatch the event to the window also.
    const doc = el.ownerDocument || el;
    const win = (doc as any).defaultView;
    if (win) {
      win.dispatchEvent(evt);
    }
  }

  getHistory(): History {
    throw _notImplemented('getHistory');
  }
  getLocation(): Location {
    throw _notImplemented('getLocation');
  }
  getUserAgent(): string {
    return 'Fake user agent';
  }

  performanceNow(): number {
    return Date.now();
  }

  supportsCookies(): boolean {
    return false;
  }
  getCookie(name: string): string {
    throw _notImplemented('getCookie');
  }
}
