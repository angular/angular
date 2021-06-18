/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {MatSnackBar as BaseMatSnackBar} from '@angular/material/snack-bar';
import {MatSnackBarModule} from './module';
import {MatSimpleSnackBar} from './simple-snack-bar';
import {MatSnackBarContainer} from './snack-bar-container';

/**
 * Service to dispatch Material Design snack bar messages.
 */
@Injectable({providedIn: MatSnackBarModule})
export class MatSnackBar extends BaseMatSnackBar {
  protected override simpleSnackBarComponent = MatSimpleSnackBar;
  protected override snackBarContainerComponent = MatSnackBarContainer;
  protected override handsetCssClass = 'mat-mdc-snack-bar-handset';
}
