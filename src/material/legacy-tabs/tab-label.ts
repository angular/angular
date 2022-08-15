/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {MAT_TAB_LABEL, MatTabLabel as MatNonLegacyTabLabel} from '@angular/material/tabs';

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[mat-tab-label], [matTabLabel]',
  providers: [{provide: MAT_TAB_LABEL, useExisting: MatLegacyTabLabel}],
})
export class MatLegacyTabLabel extends MatNonLegacyTabLabel {}
