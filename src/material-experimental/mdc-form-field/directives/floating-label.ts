/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {MDCFloatingLabel} from '@material/floating-label';

/**
 * Internal directive that creates an instance of the MDC floating label
 * component. Using a directive allows us to conditionally render a floating label
 * in the template without having to manually instantiate the `MDCFloatingLabel` component.
 *
 * The component is responsible for setting up the floating label styles, and for providing
 * an @Input that can be used by the form-field to toggle floating state of the label.
 */
@Directive({
  selector: 'label[matFormFieldFloatingLabel]',
  host: {
    'class': 'mdc-floating-label',
  },
})
export class MatFormFieldFloatingLabel extends MDCFloatingLabel implements OnDestroy {

  @Input()
  get floating() { return this._floating; }
  set floating(shouldFloat: boolean) {
    if (shouldFloat !== this._floating) {
      this._floating = shouldFloat;
      this.float(shouldFloat);
    }
  }
  private _floating = false;

  constructor(elementRef: ElementRef) {
    super(elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.destroy();
  }
}
