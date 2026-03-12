/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵsetRootDomAdapter as setRootDomAdapter} from '@angular/common';
import {ɵBrowserDomAdapter as BrowserDomAdapter} from '@angular/platform-browser';

import domino from './bundled-domino';

export function setDomTypes() {
  // Make all Domino types available in the global env.
  // NB: Any changes here should also be done in `packages/platform-server/init/src/shims.ts`.
  Object.assign(globalThis, domino.impl);
  (globalThis as any)['KeyboardEvent'] = domino.impl.Event;
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
  static override makeCurrent() {
    setDomTypes();
    setRootDomAdapter(new DominoAdapter());
  }

  override readonly supportsDOMEvents = false;
  private static defaultDoc: Document;

  override createHtmlDocument(): Document {
    return parseDocument('<html><head><title>fakeTitle</title></head><body></body></html>');
  }

  override getDefaultDocument(): Document {
    if (!DominoAdapter.defaultDoc) {
      DominoAdapter.defaultDoc = domino.createDocument();
    }
    return DominoAdapter.defaultDoc;
  }

  override isElementNode(node: any): boolean {
    return node ? node.nodeType === DominoAdapter.defaultDoc.ELEMENT_NODE : false;
  }
  override isShadowRoot(node: any): boolean {
    return node.shadowRoot == node;
  }

  /** @deprecated No longer being used in Ivy code. To be removed in version 14. */
  override getGlobalEventTarget(doc: Document, target: string): EventTarget | null {
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

  override getBaseHref(doc: Document): string {
    const length = doc.head.children.length;

    // The `<base>` can only be a direct child of `<head>` so we can save some
    // execution time by looking through them directly instead of querying for it.
    // See: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/base
    // Note that we can't cache the `href` value itself, because this method gets called with a
    // different document every time which means that in theory the value can be different too.
    for (let i = 0; i < length; i++) {
      const child = doc.head.children[i];

      // Tag names are always uppercase for HTML nodes.
      if (child.tagName === 'BASE') {
        // TODO(alxhub): Need relative path logic from BrowserDomAdapter here?
        return child.getAttribute('href') || '';
      }
    }

    return '';
  }

  override dispatchEvent(el: Node, evt: any) {
    el.dispatchEvent(evt);

    // Dispatch the event to the window also.
    const doc = el.ownerDocument || el;
    const win = (doc as any).defaultView;
    if (win) {
      win.dispatchEvent(evt);
    }
  }

  override getUserAgent(): string {
    return 'Fake user agent';
  }

  override getCookie(name: string): string {
    throw new Error('getCookie has not been implemented');
  }
}
