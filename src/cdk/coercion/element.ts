/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '@angular/core';

/**
 * Coerces an ElementRef or an Element into an element.
 * Useful for APIs that can accept either a ref or the native element itself.
 */
export function coerceElement<T>(elementOrRef: ElementRef<T> | T): T {
  return elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;
}
