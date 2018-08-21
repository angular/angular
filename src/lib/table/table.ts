/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CDK_TABLE_TEMPLATE, CdkTable} from '@angular/cdk/table';
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

// TODO(devversion): workaround for https://github.com/angular/material2/issues/12760
export const _CdkTable = CdkTable;

/**
 * Wrapper for the CdkTable with Material design styles.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-table, table[mat-table]',
  exportAs: 'matTable',
  template: CDK_TABLE_TEMPLATE,
  styleUrls: ['table.css'],
  host: {
    'class': 'mat-table',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTable<T> extends _CdkTable<T> {
  /** Overrides the sticky CSS class set by the `CdkTable`. */
  protected stickyCssClass = 'mat-table-sticky';
}
