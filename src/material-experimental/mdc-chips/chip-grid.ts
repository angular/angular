/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'mat-chip-grid',
  templateUrl: 'chip-grid.html',
  styleUrls: ['chips.css'],
  host: {
    'class': 'mat-mdc-chip-grid',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipGrid {
  // TODO: set up MDC foundation class.
}
