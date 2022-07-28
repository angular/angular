/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MAT_OPTGROUP, _MatOptgroupBase} from '@angular/material/core';

/**
 * Component that is used to group instances of `mat-option`.
 */
@Component({
  selector: 'mat-optgroup',
  exportAs: 'matOptgroup',
  templateUrl: 'optgroup.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs: ['disabled'],
  styleUrls: ['optgroup.css'],
  host: {
    'class': 'mat-optgroup',
    '[attr.role]': '_inert ? null : "group"',
    '[attr.aria-disabled]': '_inert ? null : disabled.toString()',
    '[attr.aria-labelledby]': '_inert ? null : _labelId',
    '[class.mat-optgroup-disabled]': 'disabled',
  },
  providers: [{provide: MAT_OPTGROUP, useExisting: MatLegacyOptgroup}],
})
export class MatLegacyOptgroup extends _MatOptgroupBase {}
