/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, NgZone} from '@angular/core';


/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @docs-private
 */
@Directive({
  selector: 'mat-ink-bar',
  host: {
    'class': 'mat-ink-bar',
  },
})
export class MatInkBar {
  constructor(
    private _elementRef: ElementRef,
    private _ngZone: NgZone) {}

  /**
   * Calculates the styles from the provided element in order to align the ink-bar to that element.
   * Shows the ink bar if previously set as hidden.
   * @param element
   */
  alignToElement(element: HTMLElement) {
    this.show();

    if (typeof requestAnimationFrame !== 'undefined') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this._setStyles(element));
      });
    } else {
      this._setStyles(element);
    }
  }

  /** Shows the ink bar. */
  show(): void {
    this._elementRef.nativeElement.style.visibility = 'visible';
  }

  /** Hides the ink bar. */
  hide(): void {
    this._elementRef.nativeElement.style.visibility = 'hidden';
  }

  /**
   * Sets the proper styles to the ink bar element.
   * @param element
   */
  private _setStyles(element: HTMLElement) {
    const inkBar: HTMLElement = this._elementRef.nativeElement;

    inkBar.style.left = element ? (element.offsetLeft || 0) + 'px' : '0';
    inkBar.style.width = element ? (element.offsetWidth || 0) + 'px' : '0';
  }
}
