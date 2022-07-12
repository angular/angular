/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, InjectionToken, NgZone, Optional} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {take} from 'rxjs/operators';

/**
 * Interface for a a MatInkBar positioner method, defining the positioning and width of the ink
 * bar in a set of tabs.
 */
export interface _MatInkBarPositioner {
  (element: HTMLElement): {left: string; width: string};
}

/** Injection token for the MatInkBar's Positioner. */
export const _MAT_INK_BAR_POSITIONER = new InjectionToken<_MatInkBarPositioner>(
  'MatInkBarPositioner',
  {
    providedIn: 'root',
    factory: _MAT_INK_BAR_POSITIONER_FACTORY,
  },
);

/**
 * The default positioner function for the MatInkBar.
 * @docs-private
 */
export function _MAT_INK_BAR_POSITIONER_FACTORY(): _MatInkBarPositioner {
  const method = (element: HTMLElement) => ({
    left: element ? (element.offsetLeft || 0) + 'px' : '0',
    width: element ? (element.offsetWidth || 0) + 'px' : '0',
  });

  return method;
}

/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @docs-private
 */
@Directive({
  selector: 'mat-ink-bar',
  host: {
    'class': 'mat-ink-bar',
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
})
export class MatInkBar {
  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _ngZone: NgZone,
    @Inject(_MAT_INK_BAR_POSITIONER) private _inkBarPositioner: _MatInkBarPositioner,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
  ) {}

  /**
   * Calculates the styles from the provided element in order to align the ink-bar to that element.
   * Shows the ink bar if previously set as hidden.
   * @param element
   */
  alignToElement(element: HTMLElement) {
    this.show();

    // `onStable` might not run for a while if the zone has already stabilized.
    // Wrap the call in `NgZone.run` to ensure that it runs relatively soon.
    this._ngZone.run(() => {
      this._ngZone.onStable.pipe(take(1)).subscribe(() => {
        const positions = this._inkBarPositioner(element);
        const inkBar = this._elementRef.nativeElement;
        inkBar.style.left = positions.left;
        inkBar.style.width = positions.width;
      });
    });
  }

  /** Shows the ink bar. */
  show(): void {
    this._elementRef.nativeElement.style.visibility = 'visible';
  }

  /** Hides the ink bar. */
  hide(): void {
    this._elementRef.nativeElement.style.visibility = 'hidden';
  }
}
