/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';

/** Directive that should be applied to the text element to be rendered in the snack bar. */
@Directive({
  selector: `[matSnackBarLabel]`,
  host: {
    'class': 'mat-mdc-snack-bar-label mdc-snackbar__label',
  },
})
export class MatSnackBarLabel {}

/** Directive that should be applied to the element containing the snack bar's action buttons. */
@Directive({
  selector: `[matSnackBarActions]`,
  host: {
    'class': 'mat-mdc-snack-bar-actions mdc-snackbar__actions',
  },
})
export class MatSnackBarActions {}

/** Directive that should be applied to each of the snack bar's action buttons. */
@Directive({
  selector: `[matSnackBarAction]`,
  host: {
    'class': 'mat-mdc-snack-bar-action mdc-snackbar__action',
  },
})
export class MatSnackBarAction {}
