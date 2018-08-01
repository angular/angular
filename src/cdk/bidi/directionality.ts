/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Inject, Injectable, Optional, OnDestroy} from '@angular/core';
import {DIR_DOCUMENT} from './dir-document-token';


export type Direction = 'ltr' | 'rtl';


/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
@Injectable({providedIn: 'root'})
export class Directionality implements OnDestroy {
  /** The current 'ltr' or 'rtl' value. */
  readonly value: Direction = 'ltr';

  /** Stream that emits whenever the 'ltr' / 'rtl' state changes. */
  readonly change = new EventEmitter<Direction>();

  constructor(@Optional() @Inject(DIR_DOCUMENT) _document?: any) {
    if (_document) {
      // TODO: handle 'auto' value -
      // We still need to account for dir="auto".
      // It looks like HTMLElemenet.dir is also "auto" when that's set to the attribute,
      // but getComputedStyle return either "ltr" or "rtl". avoiding getComputedStyle for now
      const bodyDir = _document.body ? _document.body.dir : null;
      const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
      const value = bodyDir || htmlDir;
      this.value = (value === 'ltr' || value === 'rtl') ? value : 'ltr';
    }
  }

  ngOnDestroy() {
    this.change.complete();
  }
}
