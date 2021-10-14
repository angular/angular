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
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {MDCNotchedOutline} from '@material/notched-outline';

/**
 * Internal component that creates an instance of the MDC notched-outline component. Using
 * a directive allows us to conditionally render a notched-outline in the template without
 * having to manually create and destroy the `MDCNotchedOutline` component whenever the
 * appearance changes.
 *
 * The component sets up the HTML structure and styles for the notched-outline. It provides
 * inputs to toggle the notch state and width.
 */
@Component({
  selector: 'div[matFormFieldNotchedOutline]',
  templateUrl: './notched-outline.html',
  host: {
    'class': 'mdc-notched-outline',
    // Besides updating the notch state through the MDC component, we toggle this class through
    // a host binding in order to ensure that the notched-outline renders correctly on the server.
    '[class.mdc-notched-outline--notched]': 'open',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatFormFieldNotchedOutline implements AfterViewInit, OnChanges, OnDestroy {
  /** Width of the notch. */
  @Input('matFormFieldNotchedOutlineWidth') width: number = 0;

  /** Whether the notch should be opened. */
  @Input('matFormFieldNotchedOutlineOpen') open: boolean = false;

  /** Instance of the MDC notched outline. */
  private _mdcNotchedOutline: MDCNotchedOutline | null = null;

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
    // Initial sync in case state has been updated before view initialization.
    this._syncNotchedOutlineState();
  }

  ngOnChanges() {
    // Whenever the width, or the open state changes, sync the notched outline to be
    // based on the new values.
    this._syncNotchedOutlineState();
  }

  ngOnDestroy() {
    if (this._mdcNotchedOutline !== null) {
      this._mdcNotchedOutline.destroy();
    }
  }

  /** Synchronizes the notched outline state to be based on the `width` and `open` inputs. */
  private _syncNotchedOutlineState() {
    if (this._mdcNotchedOutline === null) {
      return;
    }
    if (this.open) {
      this._mdcNotchedOutline.notch(this.width);
    } else {
      this._mdcNotchedOutline.closeNotch();
    }
  }
}
