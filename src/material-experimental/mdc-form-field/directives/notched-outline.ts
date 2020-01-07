/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef, OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import {MDCNotchedOutline} from '@material/notched-outline';

/**
 * Internal directive that creates an instance of the MDC notched-outline component. Using
 * a directive allows us to conditionally render a notched-outline in the template without
 * having to manually create and destroy the `MDCNotchedOutline` component whenever the
 * appearance changes.
 *
 * The directive sets up the HTML structure and styles for the notched-outline, but also
 * exposes a programmatic API to toggle the state of the notch.
 */
@Component({
  selector: 'div[matFormFieldNotchedOutline]',
  templateUrl: './notched-outline.html',
  host: {
    'class': 'mdc-notched-outline',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatFormFieldNotchedOutline implements AfterViewInit, OnDestroy {
  private _mdcNotchedOutline: MDCNotchedOutline;

  constructor(private _elementRef: ElementRef) {}

  ngAfterViewInit() {
    // The notch component relies on the view to be initialized. This means
    // that we cannot extend from the "MDCNotchedOutline".
    this._mdcNotchedOutline = MDCNotchedOutline.attachTo(this._elementRef.nativeElement);
  }

  ngOnDestroy() {
    this._mdcNotchedOutline.destroy();
  }

  /**
   * Updates classes and styles to open the notch to the specified width.
   * @param notchWidth The notch width in the outline.
   */
  notch(notchWidth: number) {
    this._mdcNotchedOutline.notch(notchWidth);
  }

  /** Closes the notch. */
  closeNotch() {
    this._mdcNotchedOutline.closeNotch();
  }
}
