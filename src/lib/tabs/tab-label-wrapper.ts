/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef} from '@angular/core';
import {CanDisable, mixinDisabled} from '@angular/material/core';

// Boilerplate for applying mixins to MatTabLabelWrapper.
/** @docs-private */
export class MatTabLabelWrapperBase {}
export const _MatTabLabelWrapperMixinBase = mixinDisabled(MatTabLabelWrapperBase);

/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[matTabLabelWrapper]',
  inputs: ['disabled'],
  host: {
    '[class.mat-tab-disabled]': 'disabled'
  }
})
export class MatTabLabelWrapper extends _MatTabLabelWrapperMixinBase implements CanDisable {
  constructor(public elementRef: ElementRef) {
    super();
  }

  /** Sets focus on the wrapper element */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  getOffsetLeft(): number {
    return this.elementRef.nativeElement.offsetLeft;
  }

  getOffsetWidth(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}
