/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {APP_ID, CSP_NONCE, Inject, Injectable, OnDestroy, Optional, PLATFORM_ID} from '@angular/core';

/** The style elements attribute name used to set value of `APP_ID` token. */
const APP_ID_ATTRIBUTE_NAME = 'ng-app-id';

@Injectable()
export class SharedStylesHost implements OnDestroy {
  // Maps all registered host nodes to a list of style nodes that have been added to the host node.
  private readonly styleRef = new Map < string /** Style string */, {
    elements: HTMLStyleElement[];
    usage: number
  }
  > ();
  private readonly hostNodes = new Set<Node>();
  private readonly styleNodesInDOM: Map<string, HTMLStyleElement>|null;
  private readonly platformIsServer: boolean;

  constructor(
      @Inject(DOCUMENT) private readonly doc: Document,
      @Inject(APP_ID) private readonly appId: string,
      @Inject(CSP_NONCE) @Optional() private nonce?: string|null,
      @Inject(PLATFORM_ID) readonly platformId: object = {}) {
    this.styleNodesInDOM = this.collectServerRenderedStyles();
    this.platformIsServer = isPlatformServer(platformId);
    this.resetHostNodes();
  }

  addStyles(styles: string[]): void {
    for (const style of styles) {
      const usageCount = this.changeUsageCount(style, 1);

      if (usageCount === 1) {
        this.onStyleAdded(style);
      }
    }
  }

  removeStyles(styles: string[]): void {
    for (const style of styles) {
      const usageCount = this.changeUsageCount(style, -1);

      if (usageCount <= 0) {
        this.onStyleRemoved(style);
      }
    }
  }

  ngOnDestroy(): void {
    const styleNodesInDOM = this.styleNodesInDOM;
    if (styleNodesInDOM) {
      styleNodesInDOM.forEach((node) => node.remove());
      styleNodesInDOM.clear();
    }

    for (const style of this.getAllStyles()) {
      this.onStyleRemoved(style);
    }

    this.resetHostNodes();
  }

  addHost(hostNode: Node): void {
    this.hostNodes.add(hostNode);

    for (const style of this.getAllStyles()) {
      this.addStyleToHost(hostNode, style);
    }
  }

  removeHost(hostNode: Node): void {
    this.hostNodes.delete(hostNode);
  }

  private getAllStyles(): IterableIterator<string> {
    return this.styleRef.keys();
  }

  private onStyleAdded(style: string): void {
    for (const host of this.hostNodes) {
      this.addStyleToHost(host, style);
    }
  }

  private onStyleRemoved(style: string): void {
    const styleRef = this.styleRef;
    styleRef.get(style)?.elements?.forEach((node) => node.remove());
    styleRef.delete(style);
  }

  private collectServerRenderedStyles(): Map<string, HTMLStyleElement>|null {
    const styles = this.doc.head?.querySelectorAll<HTMLStyleElement>(
        `style[${APP_ID_ATTRIBUTE_NAME}="${this.appId}"]`);

    if (styles?.length) {
      const styleMap = new Map<string, HTMLStyleElement>();

      styles.forEach((style) => {
        if (style.textContent != null) {
          styleMap.set(style.textContent, style);
        }
      });

      return styleMap;
    }

    return null;
  }

  private changeUsageCount(style: string, delta: number): number {
    const map = this.styleRef;
    if (map.has(style)) {
      const styleRefValue = map.get(style)!;
      styleRefValue.usage += delta;

      return styleRefValue.usage;
    }

    map.set(style, {usage: delta, elements: []});
    return delta;
  }

  private getStyleElement(host: Node, style: string): HTMLStyleElement {
    const styleNodesInDOM = this.styleNodesInDOM;
    const styleEl = styleNodesInDOM?.get(style);
    if (styleEl?.parentNode === host) {
      // `styleNodesInDOM` cannot be undefined due to the above `styleNodesInDOM?.get`.
      styleNodesInDOM!.delete(style);

      styleEl.removeAttribute(APP_ID_ATTRIBUTE_NAME);

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        // This attribute is solely used for debugging purposes.
        styleEl.setAttribute('ng-style-reused', '');
      }

      return styleEl;
    } else {
      const styleEl = this.doc.createElement('style');

      if (this.nonce) {
        styleEl.setAttribute('nonce', this.nonce);
      }

      styleEl.textContent = style;

      if (this.platformIsServer) {
        styleEl.setAttribute(APP_ID_ATTRIBUTE_NAME, this.appId);
      }

      return styleEl;
    }
  }

  private addStyleToHost(host: Node, style: string): void {
    const styleEl = this.getStyleElement(host, style);

    host.appendChild(styleEl);

    const styleRef = this.styleRef;
    const styleElRef = styleRef.get(style)?.elements;
    if (styleElRef) {
      styleElRef.push(styleEl);
    } else {
      styleRef.set(style, {elements: [styleEl], usage: 1});
    }
  }

  private resetHostNodes(): void {
    const hostNodes = this.hostNodes;
    hostNodes.clear();
    // Re-add the head element back since this is the default host.
    hostNodes.add(this.doc.head);
  }
}
