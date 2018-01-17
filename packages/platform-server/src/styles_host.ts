/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Inject, Injectable, Optional} from '@angular/core';
import {DOCUMENT, ɵDomAdapter as DomAdapter, ɵSharedStylesHost as SharedStylesHost, ɵTRANSITION_ID, ɵgetDOM as getDOM} from '@angular/platform-browser';

@Injectable()
export class ServerStylesHost extends SharedStylesHost {
  private head: any = null;

  constructor(
      @Inject(DOCUMENT) private doc: any,
      @Optional() @Inject(ɵTRANSITION_ID) private transitionId: string) {
    super();
    this.head = getDOM().getElementsByTagName(doc, 'head')[0];
  }

  private _addStyle(style: string): void {
    let adapter = getDOM();
    const el = adapter.createElement('style');
    adapter.setText(el, style);
    if (!!this.transitionId) {
      adapter.setAttribute(el, 'ng-transition', this.transitionId);
    }
    adapter.appendChild(this.head, el);
  }

  onStylesAdded(additions: Set<string>) { additions.forEach(style => this._addStyle(style)); }
}
