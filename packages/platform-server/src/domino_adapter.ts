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

  readonly supportsDOMEvents = false;
  private static defaultDoc: Document;

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
    // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
    return doc.documentElement!.querySelector('base')?.getAttribute('href') || '';
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

  getUserAgent(): string {
    return 'Fake user agent';
  }

  getCookie(name: string): string {
    throw new Error('getCookie has not been implemented');
  }
}
