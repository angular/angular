/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, OnDestroy} from '@angular/core';
import {MDCLineRipple} from '@material/line-ripple';

/**
 * Internal directive that creates an instance of the MDC line-ripple component. Using a
 * directive allows us to conditionally render a line-ripple in the template without having
 * to manually create and destroy the `MDCLineRipple` component whenever the condition changes.
 *
 * The directive sets up the styles for the line-ripple and provides an API for activating
 * and deactivating the line-ripple.
 */
@Directive({
  selector: 'div[matFormFieldLineRipple]',
  host: {
    'class': 'mdc-line-ripple',
  },
})
export class MatFormFieldLineRipple extends MDCLineRipple implements OnDestroy {
  constructor(elementRef: ElementRef) {
    super(elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.destroy();
  }
}
