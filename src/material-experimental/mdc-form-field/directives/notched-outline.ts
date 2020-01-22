/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
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
  private _mdcNotchedOutline: MDCNotchedOutline|null = null;

  constructor(private _elementRef: ElementRef, private _platform: Platform) {}

  ngAfterViewInit() {
    // The notched outline cannot be attached in the server platform. It schedules tasks
    // for the next browser animation frame and relies on element client rectangles to render
    // the outline notch. To avoid failures on the server, we just do not initialize it,
    // but the actual notched-outline styles will be still displayed.
    if (this._platform.isBrowser) {
      // The notch component relies on the view to be initialized. This means
      // that we cannot extend from the "MDCNotchedOutline".
      this._mdcNotchedOutline = MDCNotchedOutline.attachTo(this._elementRef.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this._mdcNotchedOutline !== null) {
      this._mdcNotchedOutline.destroy();
    }
  }

  /**
   * Updates classes and styles to open the notch to the specified width.
   * @param notchWidth The notch width in the outline.
   */
  notch(notchWidth: number) {
    if (this._mdcNotchedOutline !== null) {
      this._mdcNotchedOutline.notch(notchWidth);
    }
  }

  /** Closes the notch. */
  closeNotch() {
    if (this._mdcNotchedOutline !== null) {
      this._mdcNotchedOutline.closeNotch();
    }
  }
}
