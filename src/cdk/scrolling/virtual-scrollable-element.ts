/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Directive, ElementRef, NgZone, Optional} from '@angular/core';
import {ScrollDispatcher} from './scroll-dispatcher';
import {CdkVirtualScrollable, VIRTUAL_SCROLLABLE} from './virtual-scrollable';

/**
 * Provides a virtual scrollable for the element it is attached to.
 */
@Directive({
  selector: '[cdkVirtualScrollingElement]',
  providers: [{provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableElement}],
  host: {
    'class': 'cdk-virtual-scrollable',
  },
})
export class CdkVirtualScrollableElement extends CdkVirtualScrollable {
  constructor(
    elementRef: ElementRef,
    scrollDispatcher: ScrollDispatcher,
    ngZone: NgZone,
    @Optional() dir: Directionality,
  ) {
    super(elementRef, scrollDispatcher, ngZone, dir);
  }

  override measureBoundingClientRectWithScrollOffset(
    from: 'left' | 'top' | 'right' | 'bottom',
  ): number {
    return (
      this.getElementRef().nativeElement.getBoundingClientRect()[from] -
      this.measureScrollOffset(from)
    );
  }
}
