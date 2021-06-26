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
}

@Injectable()
export class DomSharedStylesHost extends SharedStylesHost implements OnDestroy {
  private _insertionNodes = new Map<Node, [hostCount: number, styleNodes: Node[]]>();

  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
    this.addHost(_doc.head);
  }

  private _addStyles(styles: Set<string>, insertionNode: Node, styleNodes: Node[]): void {
    styles.forEach(style => {
      const styleEl = this._doc.createElement('style');
      styleEl.textContent = style;
      styleNodes.push(insertionNode.appendChild(styleEl));
    });
  }

  addHost(insertionNode: Node): void {
    const trackedStyles = this._insertionNodes.get(insertionNode);
    if (trackedStyles) {
      trackedStyles[0]++;
    } else {
      const styleNodes: Node[] = [];
      this._addStyles(this._stylesSet, insertionNode, styleNodes);
      this._insertionNodes.set(insertionNode, [1, styleNodes]);
    }
  }

  removeHost(insertionNode: Node): void {
    const trackedStyles = this._insertionNodes.get(insertionNode);
    if (trackedStyles) {
      const [hostCount, styleNodes] = trackedStyles;
      if (hostCount > 1) {
        trackedStyles[0]--;
      } else {
        styleNodes.forEach(removeStyle);
        this._insertionNodes.delete(insertionNode);
      }
    }
  }

  onStylesAdded(additions: Set<string>): void {
    this._insertionNodes.forEach(([, styleNodes], insertionNode) => {
      this._addStyles(additions, insertionNode, styleNodes);
    });
  }

  ngOnDestroy(): void {
    this._insertionNodes.forEach((_, insertionNode) => this.removeHost(insertionNode));
  }
}

function removeStyle(styleNode: Node): void {
  getDOM().remove(styleNode);
}
