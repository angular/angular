/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {matSnackBarAnimations, _MatSnackBarContainerBase} from '@angular/material/snack-bar';

/**
 * Internal component that wraps user-provided snack bar content.
 * @docs-private
 */
@Component({
  selector: 'mat-snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrls: ['snack-bar-container.css'],
  // In Ivy embedded views will be change detected from their declaration place, rather than
  // where they were stamped out. This means that we can't have the snack bar container be OnPush,
  // because it might cause snack bars that were opened from a template not to be out of date.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  animations: [matSnackBarAnimations.snackBarState],
  host: {
    'class': 'mdc-snackbar mat-mdc-snack-bar-container mdc-snackbar--open',
    '[@state]': '_animationState',
    '(@state.done)': 'onAnimationEnd($event)',
  },
})
export class MatSnackBarContainer extends _MatSnackBarContainerBase {
  /**
   * Element that will have the `mdc-snackbar__label` class applied if the attached component
   * or template does not have it. This ensures that the appropriate structure, typography, and
   * color is applied to the attached view.
   */
  @ViewChild('label', {static: true}) _label: ElementRef;

  /** Applies the correct CSS class to the label based on its content. */
  protected override _afterPortalAttached() {
    super._afterPortalAttached();

    // Check to see if the attached component or template uses the MDC template structure,
    // specifically the MDC label. If not, the container should apply the MDC label class to this
    // component's label container, which will apply MDC's label styles to the attached view.
    const label = this._label.nativeElement;
    const labelClass = 'mdc-snackbar__label';
    label.classList.toggle(labelClass, !label.querySelector(`.${labelClass}`));
  }
}
