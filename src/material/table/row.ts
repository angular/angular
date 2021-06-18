/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CDK_ROW_TEMPLATE,
  CdkFooterRow,
  CdkFooterRowDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkNoDataRow
} from '@angular/cdk/table';
import {ChangeDetectionStrategy, Component, Directive, ViewEncapsulation} from '@angular/core';

/**
 * Header row definition for the mat-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[matHeaderRowDef]',
  providers: [{provide: CdkHeaderRowDef, useExisting: MatHeaderRowDef}],
  inputs: ['columns: matHeaderRowDef', 'sticky: matHeaderRowDefSticky'],
})
export class MatHeaderRowDef extends CdkHeaderRowDef {}

/**
 * Footer row definition for the mat-table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
@Directive({
  selector: '[matFooterRowDef]',
  providers: [{provide: CdkFooterRowDef, useExisting: MatFooterRowDef}],
  inputs: ['columns: matFooterRowDef', 'sticky: matFooterRowDefSticky'],
})
export class MatFooterRowDef extends CdkFooterRowDef {}

/**
 * Data row definition for the mat-table.
 * Captures the data row's template and other properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
@Directive({
  selector: '[matRowDef]',
  providers: [{provide: CdkRowDef, useExisting: MatRowDef}],
  inputs: ['columns: matRowDefColumns', 'when: matRowDefWhen'],
})
export class MatRowDef<T> extends CdkRowDef<T> {
}

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'mat-header-row, tr[mat-header-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-header-row',
    'role': 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matHeaderRow',
  providers: [{provide: CdkHeaderRow, useExisting: MatHeaderRow}],
})
export class MatHeaderRow extends CdkHeaderRow {
}

/** Footer template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'mat-footer-row, tr[mat-footer-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-footer-row',
    'role': 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matFooterRow',
  providers: [{provide: CdkFooterRow, useExisting: MatFooterRow}],
})
export class MatFooterRow extends CdkFooterRow {
}

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'mat-row, tr[mat-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-row',
    'role': 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matRow',
  providers: [{provide: CdkRow, useExisting: MatRow}],
})
export class MatRow extends CdkRow {
}

/** Row that can be used to display a message when no data is shown in the table. */
@Directive({
  selector: 'ng-template[matNoDataRow]',
  providers: [{provide: CdkNoDataRow, useExisting: MatNoDataRow}],
})
export class MatNoDataRow extends CdkNoDataRow {
}
