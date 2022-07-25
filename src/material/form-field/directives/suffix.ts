/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, InjectionToken} from '@angular/core';

/**
 * Injection token that can be used to reference instances of `MatSuffix`. It serves as
 * alternative token to the actual `MatSuffix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_SUFFIX = new InjectionToken<MatSuffix>('MatSuffix');

/** Suffix to be placed at the end of the form field. */
@Directive({
  selector: '[matSuffix], [matIconSuffix], [matTextSuffix]',
  providers: [{provide: MAT_SUFFIX, useExisting: MatSuffix}],
})
export class MatSuffix {
  _isText = false;

  constructor(elementRef: ElementRef) {
    this._isText = elementRef.nativeElement.hasAttribute('matTextSuffix');
  }
}
