/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, InjectionToken} from '@angular/core';

/**
 * Injection token that can be used to reference instances of `MatPrefix`. It serves as
 * alternative token to the actual `MatPrefix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_PREFIX = new InjectionToken<MatPrefix>('MatPrefix');

/** Prefix to be placed in front of the form field. */
@Directive({
  selector: '[matPrefix], [matIconPrefix], [matTextPrefix]',
  providers: [{provide: MAT_PREFIX, useExisting: MatPrefix}],
})
export class MatPrefix {
  _isText = false;

  constructor(elementRef: ElementRef) {
    this._isText = elementRef.nativeElement.hasAttribute('matTextPrefix');
  }
}
