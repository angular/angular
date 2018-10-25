/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef} from '@angular/core';
import {FocusableOption} from '@angular/cdk/a11y';


@Directive({
  selector: '[cdkStepHeader]',
  host: {
    'role': 'tab',
  },
})
export class CdkStepHeader implements FocusableOption {
  constructor(protected _elementRef: ElementRef<HTMLElement>) {}

  /** Focuses the step header. */
  focus() {
    this._elementRef.nativeElement.focus();
  }
}
