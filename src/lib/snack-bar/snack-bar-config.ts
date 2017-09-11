/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewContainerRef, InjectionToken} from '@angular/core';
import {AriaLivePoliteness} from '@angular/cdk/a11y';
import {Direction} from '@angular/cdk/bidi';

export const MD_SNACK_BAR_DATA = new InjectionToken<any>('MdSnackBarData');

/** Possible values for horizontalPosition on MdSnackBarConfig. */
export type MdSnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';

/** Possible values for verticalPosition on MdSnackBarConfig. */
export type MdSnackBarVerticalPosition = 'top' | 'bottom';

/**
 * Configuration used when opening a snack-bar.
 */
export class MdSnackBarConfig {
  /** The politeness level for the MdAriaLiveAnnouncer announcement. */
  politeness?: AriaLivePoliteness = 'assertive';

  /** Message to be announced by the MdAriaLiveAnnouncer */
  announcementMessage?: string = '';

  /** The view container to place the overlay for the snack bar into. */
  viewContainerRef?: ViewContainerRef;

  /** The length of time in milliseconds to wait before automatically dismissing the snack bar. */
  duration?: number = 0;

  /** Extra CSS classes to be added to the snack bar container. */
  extraClasses?: string[];

  /** Text layout direction for the snack bar. */
  direction?: Direction = 'ltr';

  /** Data being injected into the child component. */
  data?: any = null;

  /** The horizontal position to place the snack bar. */
  horizontalPosition?: MdSnackBarHorizontalPosition = 'center';

  /** The vertical position to place the snack bar. */
  verticalPosition?: MdSnackBarVerticalPosition = 'bottom';
}
