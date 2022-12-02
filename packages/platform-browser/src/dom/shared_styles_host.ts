/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class SharedStylesHost implements OnDestroy {
  private readonly usedStyles = new Map<string /** Style string */, number /** Usage count */>();

  addStyles(styles: string[]): void {
    for (const style of styles) {
      let usedCount = this.usedStyles.get(style) ?? 0;
      usedCount++;
      this.usedStyles.set(style, usedCount);

      if (usedCount === 1) {
        this.onStyleAdded(style);
      }
    }
  }

  removeStyles(styles: string[]): void {
    for (const style of styles) {
      let usedCount = this.usedStyles.get(style) ?? 0;
      usedCount--;

      if (usedCount > 0) {
        this.usedStyles.set(style, usedCount);
      } else {
        this.usedStyles.delete(style);
        this.onStyleRemoved(style);
      }
    }
  }

  onStyleRemoved(style: string): void {}

  onStyleAdded(style: string): void {}

  getAllStyles(): IterableIterator<string> {
    return this.usedStyles.keys();
  }

  ngOnDestroy(): void {
    for (const style of this.getAllStyles()) {
      this.onStyleRemoved(style);
    }

    this.usedStyles.clear();
  }
}

@Injectable()
export class DomSharedStylesHost extends SharedStylesHost implements OnDestroy {
  // Maps all registered host nodes to a list of style nodes that have been added to the host node.
  private readonly styleRef = new Map<string, HTMLStyleElement[]>();
  private hostNodes = new Set<Node>();

  constructor(@Inject(DOCUMENT) private readonly doc: any) {
    super();
    this.hostNodes.add(this.doc.head);
  }

  override onStyleAdded(style: string): void {
    for (const host of this.hostNodes) {
      this.addStyleToHost(host, style);
    }
  }

  override onStyleRemoved(style: string): void {
    const styleElements = this.styleRef.get(style);
    styleElements?.forEach(e => e.remove());
    this.styleRef.delete(style);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.styleRef.clear();
    this.hostNodes.clear();
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

  private addStyleToHost(host: Node, style: string): void {
    const styleEl = this.doc.createElement('style');
    styleEl.textContent = style;
    host.appendChild(styleEl);

    const styleRef = this.styleRef.get(style);
    if (styleRef) {
      styleRef.push(styleEl);
    } else {
      this.styleRef.set(style, [styleEl]);
    }
  }
}
