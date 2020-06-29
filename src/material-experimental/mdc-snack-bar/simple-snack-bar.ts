/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Inject, ViewEncapsulation} from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  TextOnlySnackBar,
  MatSnackBarRef,
  SimpleSnackBar
} from '@angular/material/snack-bar';

@Component({
  selector: 'mat-simple-snack-bar',
  templateUrl: 'simple-snack-bar.html',
  styleUrls: ['simple-snack-bar.css'],
  exportAs: 'matSnackBar',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mat-mdc-simple-snack-bar',
  }
})
export class MatSimpleSnackBar implements TextOnlySnackBar {
  constructor(
      public snackBarRef: MatSnackBarRef<SimpleSnackBar>,
      @Inject(MAT_SNACK_BAR_DATA) public data: {message: string, action: string}) {
  }
}

