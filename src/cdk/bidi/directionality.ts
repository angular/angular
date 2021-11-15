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

/** Regex that matches locales with an RTL script. Taken from `goog.i18n.bidi.isRtlLanguage`. */
const RTL_LOCALE_PATTERN =
  /^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;

/** Resolves a string value to a specific direction. */
export function _resolveDirectionality(rawValue: string): Direction {
  const value = rawValue?.toLowerCase() || '';

  if (value === 'auto' && typeof navigator !== 'undefined' && navigator?.language) {
    return RTL_LOCALE_PATTERN.test(navigator.language) ? 'rtl' : 'ltr';
  }

  return value === 'rtl' ? 'rtl' : 'ltr';
}

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
      const bodyDir = _document.body ? _document.body.dir : null;
      const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
      this.value = _resolveDirectionality(bodyDir || htmlDir || 'ltr');
    }
  }

  ngOnDestroy() {
    this.change.complete();
  }
}
