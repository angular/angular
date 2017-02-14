/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OnDestroy} from '@angular/core';
import {DomAdapter, getDOM} from './dom_adapter';
import {DOCUMENT} from './dom_tokens';

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

  getAllStyles(): string[] { return Array.from(this._stylesSet); }
}

@Injectable()
export class DomSharedStylesHost extends SharedStylesHost implements OnDestroy {
  private _dom: DomAdapter;
  private _hostNodes = new Set<Node>();
  private _styleNodes = new Set<Node>();

  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
    this._dom = getDOM();
    this._hostNodes.add(_doc.head);
  }

  private _addStylesToHost(styles: Set<string>, host: Node): void {
    styles.forEach((style: string) => {
      const styleEl = this._dom.createElement('style');
      this._dom.setText(styleEl, style);
      this._styleNodes.add(this._dom.appendChild(host, styleEl));
    });
  }

  addHost(hostNode: Node): void {
    this._addStylesToHost(this._stylesSet, hostNode);
    this._hostNodes.add(hostNode);
  }

  removeHost(hostNode: Node): void { this._hostNodes.delete(hostNode); }

  onStylesAdded(additions: Set<string>): void {
    this._hostNodes.forEach(hostNode => this._addStylesToHost(additions, hostNode));
  }

  ngOnDestroy(): void { this._styleNodes.forEach(styleNode => this._dom.remove(styleNode)); }
}
