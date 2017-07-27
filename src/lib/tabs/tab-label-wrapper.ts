/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef} from '@angular/core';
import {CanDisable, mixinDisabled} from '../core/common-behaviors/disabled';

// Boilerplate for applying mixins to MdTabLabelWrapper.
/** @docs-private */
export class MdTabLabelWrapperBase {}
export const _MdTabLabelWrapperMixinBase = mixinDisabled(MdTabLabelWrapperBase);

/**
 * Used in the `md-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[mdTabLabelWrapper], [matTabLabelWrapper]',
  inputs: ['disabled'],
  host: {
    '[class.mat-tab-disabled]': 'disabled'
  }
})
export class MdTabLabelWrapper extends _MdTabLabelWrapperMixinBase implements CanDisable {
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
