/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {APP_ID, Inject, Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class SharedStylesHost implements OnDestroy {
  private readonly usageCount = new Map<string /** Style string */, number /** Usage count */>();

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

      if (usageCount === 0) {
        this.onStyleRemoved(style);
      }
    }
  }

  onStyleRemoved(style: string): void {}

  onStyleAdded(style: string): void {}

  getAllStyles(): IterableIterator<string> {
    return this.usageCount.keys();
  }

  private changeUsageCount(style: string, delta: number): number {
    const map = this.usageCount;
    let usage = map.get(style) ?? 0;
    usage += delta;

    if (usage > 0) {
      map.set(style, usage);
    } else {
      map.delete(style);
    }

    return usage;
  }

  ngOnDestroy(): void {
    for (const style of this.getAllStyles()) {
      this.onStyleRemoved(style);
    }

    this.usageCount.clear();
  }
}

@Injectable()
export class DomSharedStylesHost extends SharedStylesHost implements OnDestroy {
  // Maps all registered host nodes to a list of style nodes that have been added to the host node.
  private readonly styleRef = new Map<string, HTMLStyleElement[]>();
  private hostNodes = new Set<Node>();
  private styleNodesInDOM: Map<string, HTMLStyleElement>|null;

  constructor(
      @Inject(DOCUMENT) private readonly doc: Document, @Inject(APP_ID) private appId: string) {
    super();
    this.styleNodesInDOM = this.collectServerRenderedStyles();
    this.resetHostNodes();
  }

  override onStyleAdded(style: string): void {
    for (const host of this.hostNodes) {
      this.addStyleToHost(host, style);
    }
  }

  override onStyleRemoved(style: string): void {
    const styleRef = this.styleRef;
    const styleElements = styleRef.get(style);
    styleElements?.forEach(node => node.remove());
    styleRef.delete(style);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.styleRef.clear();
    this.resetHostNodes();

    const styleNodesInDOM = this.styleNodesInDOM;
    if (styleNodesInDOM) {
      styleNodesInDOM.forEach(node => node.remove());
      styleNodesInDOM.clear();
    }
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

  private collectServerRenderedStyles(): Map<string, HTMLStyleElement>|null {
    const styles =
        this.doc.head?.querySelectorAll<HTMLStyleElement>(`style[ng-app="${this.appId}"]`);

    if (styles?.length) {
      const styleMap = new Map<string, HTMLStyleElement>();

      styles.forEach(style => {
        if (style.textContent != null) {
          styleMap.set(style.textContent, style);
        }
      });

      return styleMap;
    }

    return null;
  }

  private getStyleElement(host: Node, style: string): HTMLStyleElement {
    const styleNodesInDOM = this.styleNodesInDOM;
    const styleEl = styleNodesInDOM?.get(style);
    if (styleEl?.parentNode === host) {
      // `styleNodesInDOM` cannot be undefined due to the above `styleNodesInDOM?.get`.
      styleNodesInDOM!.delete(style);
      styleEl.removeAttribute('ng-app');

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        // This attribute is solely used for debugging purposes.
        styleEl.setAttribute('ng-style-reused', '');
      }

      return styleEl;
    } else {
      const styleEl = this.doc.createElement('style');
      styleEl.textContent = style;

      return styleEl;
    }
  }

  private addStyleToHost(host: Node, style: string): void {
    const styleEl = this.getStyleElement(host, style);

    host.appendChild(styleEl);

    const styleRef = this.styleRef;
    const styleElRef = styleRef.get(style);
    if (styleElRef) {
      styleElRef.push(styleEl);
    } else {
      styleRef.set(style, [styleEl]);
    }
  }

  private resetHostNodes(): void {
    const hostNodes = this.hostNodes;
    hostNodes.clear();
    // Re-add the head element back since this is the default host.
    hostNodes.add(this.doc.head);
  }
}
