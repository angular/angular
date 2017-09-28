/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  EventEmitter,
  Injectable,
  Optional,
  SkipSelf,
  Inject,
  InjectionToken,
} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';


export type Direction = 'ltr' | 'rtl';

/**
 * Injection token used to inject the document into Directionality.
 * This is used so that the value can be faked in tests.
 *
 * We can't use the real document in tests because changing the real `dir` causes geometry-based
 * tests in Safari to fail.
 *
 * We also can't re-provide the DOCUMENT token from platform-brower because the unit tests
 * themselves use things like `querySelector` in test code.
 */
export const DIR_DOCUMENT = new InjectionToken<Document>('mat-dir-doc');

/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
@Injectable()
export class Directionality {
  readonly value: Direction = 'ltr';
  readonly change = new EventEmitter<void>();

  constructor(@Optional() @Inject(DIR_DOCUMENT) _document?: any) {
    if (_document) {
      // TODO: handle 'auto' value -
      // We still need to account for dir="auto".
      // It looks like HTMLElemenet.dir is also "auto" when that's set to the attribute,
      // but getComputedStyle return either "ltr" or "rtl". avoiding getComputedStyle for now
      const bodyDir = _document.body ? _document.body.dir : null;
      const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
      this.value = (bodyDir || htmlDir || 'ltr') as Direction;
    }
  }
}

/** @docs-private */
export function DIRECTIONALITY_PROVIDER_FACTORY(parentDirectionality, _document) {
  return parentDirectionality || new Directionality(_document);
}

/** @docs-private */
export const DIRECTIONALITY_PROVIDER = {
  // If there is already a Directionality available, use that. Otherwise, provide a new one.
  provide: Directionality,
  deps: [[new Optional(), new SkipSelf(), Directionality], [new Optional(), DOCUMENT]],
  useFactory: DIRECTIONALITY_PROVIDER_FACTORY
};
