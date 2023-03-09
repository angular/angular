/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {APP_ID, Inject, Injectable} from '@angular/core';
import {ɵSharedStylesHost as SharedStylesHost} from '@angular/platform-browser';

@Injectable()
export class ServerStylesHost extends SharedStylesHost {
  private head: any = null;
  private _styleNodes = new Set<HTMLElement>();

  constructor(@Inject(DOCUMENT) doc: any, @Inject(APP_ID) private appId: string) {
    super();
    this.head = doc.getElementsByTagName('head')[0];
  }

  override onStyleAdded(style: string): void {
    const adapter = getDOM();
    const el = adapter.createElement('style');
    el.textContent = style;
    if (!!this.appId) {
      el.setAttribute('ng-app', this.appId);
    }
    this.head.appendChild(el);
    this._styleNodes.add(el);
  }

  override ngOnDestroy() {
    this._styleNodes.forEach(styleNode => styleNode.remove());
    this._styleNodes.clear();
    super.ngOnDestroy();
  }
}
