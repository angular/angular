/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/** The injection token used to specify the StickyPositioningListener. */
export const STICKY_POSITIONING_LISTENER =
    new InjectionToken<StickyPositioningListener>('CDK_SPL');

export type StickySize = number|null|undefined;

export interface StickyUpdate {
  sizes: StickySize[];
}

/**
 * If provided, CdkTable will call the methods below when it updates the size/
 * postion/etc of its sticky rows and columns.
 */
export interface StickyPositioningListener {
  /** Called when CdkTable updates its sticky start columns. */
  stickyColumnsUpdated(update: StickyUpdate): void;

  /** Called when CdkTable updates its sticky end columns. */
  stickyEndColumnsUpdated(update: StickyUpdate): void;

  /** Called when CdkTable updates its sticky header rows. */
  stickyHeaderRowsUpdated(update: StickyUpdate): void;

  /** Called when CdkTable updates its sticky footer rows. */
  stickyFooterRowsUpdated(update: StickyUpdate): void;
}
