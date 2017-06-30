/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkHeaderRow, CdkRow, CDK_ROW_TEMPLATE} from '@angular/cdk';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MdHeaderRow = CdkHeaderRow;
export const _MdRow = CdkRow;

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'md-header-row, mat-header-row',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-header-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdHeaderRow extends _MdHeaderRow { }

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'md-row, mat-row',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdRow extends _MdRow { }
