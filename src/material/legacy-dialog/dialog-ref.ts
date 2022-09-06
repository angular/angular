/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatDialogRef as NewDialogRef} from '@angular/material/dialog';

/**
 * Reference to a dialog opened via the MatDialog service.
 * @deprecated Use `MatDialogRef` from `@angular/material/dialog` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyDialogRef<T, R = any> extends NewDialogRef<T, R> {}
