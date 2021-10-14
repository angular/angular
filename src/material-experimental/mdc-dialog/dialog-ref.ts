/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef} from '@angular/cdk/overlay';
import {MatDialogRef as NonMdcDialogRef} from '@angular/material/dialog';
import {MatDialogContainer} from './dialog-container';

// Counter for unique dialog ids.
let uniqueId = 0;

/**
 * Reference to a dialog opened via the MatDialog service.
 */
export class MatDialogRef<T, R = any> extends NonMdcDialogRef<T, R> {
  constructor(
    overlayRef: OverlayRef,
    containerInstance: MatDialogContainer,
    id: string = `mat-mdc-dialog-${uniqueId++}`,
  ) {
    super(overlayRef, containerInstance, id);
  }
}
