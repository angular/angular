/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewContainerRef, InjectionToken} from '@angular/core';
import {Direction} from '@angular/cdk/bidi';

/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
export const MAT_BOTTOM_SHEET_DATA = new InjectionToken<any>('MatBottomSheetData');

/**
 * Configuration used when opening a bottom sheet.
 */
export class MatBottomSheetConfig<D = any> {
  /** The view container to place the overlay for the bottom sheet into. */
  viewContainerRef?: ViewContainerRef;

  /** Extra CSS classes to be added to the bottom sheet container. */
  panelClass?: string | string[];

  /** Text layout direction for the bottom sheet. */
  direction?: Direction;

  /** Data being injected into the child component. */
  data?: D | null = null;

  /** Whether the bottom sheet has a backdrop. */
  hasBackdrop?: boolean = true;

  /** Custom class for the backdrop. */
  backdropClass?: string;

  /** Whether the user can use escape or clicking outside to close the bottom sheet. */
  disableClose?: boolean = false;

  /** Aria label to assign to the bottom sheet element. */
  ariaLabel?: string | null = null;

  /** Whether the bottom sheet should close when the user goes backwards/forwards in history. */
  closeOnNavigation?: boolean = true;

  /** Whether the bottom sheet should focus the first focusable element on open. */
  autoFocus?: boolean = true;
}
