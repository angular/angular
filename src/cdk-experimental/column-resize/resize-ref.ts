/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';

/** Tracks state of resize events in progress. */
export class ResizeRef {
  constructor(
    readonly origin: ElementRef,
    readonly overlayRef: OverlayRef,
    readonly minWidthPx: number,
    readonly maxWidthPx: number,
  ) {}
}
