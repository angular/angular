/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class SharedStylesHost {
  /** @internal */
  protected _stylesSet = new Set<string>();

  addStyles(styles: string[]): void {
    const additions = new Set<string>();
    styles.forEach(style => {
      if (!this._stylesSet.has(style)) {
        this._stylesSet.add(style);
        additions.add(style);
      }
    });
    this.onStylesAdded(additions);
  }

  onStylesAdded(additions: Set<string>): void {}

  getAllStyles(): string[] {
    return Array.from(this._stylesSet);
  }
}

@Injectable()
export class DomSharedStylesHost extends SharedStylesHost implements OnDestroy {
  // Maps all registered host nodes to a list of style nodes that have been added to the host node.
  private _hostNodes = new Map<Node, Node[]>();

  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
    this._hostNodes.set(_doc.head, []);
  }

  private _addStylesToHost(styles: Set<string>, host: Node, styleNodes: Node[]): void {
    styles.forEach((style: string) => {
      const styleEl = this._doc.createElement('style');
      styleEl.textContent = style;
      styleNodes.push(host.appendChild(styleEl));
    });
  }

  addHost(hostNode: Node): void {
    const styleNodes: Node[] = [];
    this._addStylesToHost(this._stylesSet, hostNode, styleNodes);
    this._hostNodes.set(hostNode, styleNodes);
  }

  removeHost(hostNode: Node): void {
    const styleNodes = this._hostNodes.get(hostNode);
    if (styleNodes) {
      styleNodes.forEach(removeStyle);
    }
    this._hostNodes.delete(hostNode);
  }

  override onStylesAdded(additions: Set<string>): void {
    this._hostNodes.forEach((styleNodes, hostNode) => {
      this._addStylesToHost(additions, hostNode, styleNodes);
    });
  }

  ngOnDestroy(): void {
    this._hostNodes.forEach(styleNodes => styleNodes.forEach(removeStyle));
  }
}

function removeStyle(styleNode: Node): void {
  getDOM().remove(styleNode);
}
