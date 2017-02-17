/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Inject, Injectable} from '@angular/core';
import {DOCUMENT, ɵSharedStylesHost as SharedStylesHost, ɵgetDOM as getDOM} from '@angular/platform-browser';

import {Parse5DomAdapter} from './parse5_adapter';

@Injectable()
export class ServerStylesHost extends SharedStylesHost {
  private root: any = null;
  private buffer: string[] = [];

  constructor(@Inject(DOCUMENT) private doc: any, private appRef: ApplicationRef) { super(); }

  private _addStyle(style: string): void {
    let adapter: Parse5DomAdapter = getDOM() as Parse5DomAdapter;
    const el = adapter.createElement('style');
    adapter.setText(el, style);
    adapter.appendChild(this.root, el);
  }

  onStylesAdded(additions: Set<string>) {
    if (!this.root) {
      additions.forEach(style => this.buffer.push(style));
    } else {
      additions.forEach(style => this._addStyle(style));
    }
  }

  rootComponentIsReady(): void {
    if (!!this.root) {
      return;
    }
    this.root = this.appRef.components[0].location.nativeElement;
    this.buffer.forEach(style => this._addStyle(style));
    this.buffer = null;
  }
}
