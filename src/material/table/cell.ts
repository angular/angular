/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkFooterCell,
  CdkFooterCellDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
} from '@angular/cdk/table';

/**
 * Cell definition for the mat-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
  selector: '[matCellDef]',
  providers: [{provide: CdkCellDef, useExisting: MatCellDef}],
})
export class MatCellDef extends CdkCellDef {}

/**
 * Header cell definition for the mat-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[matHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: MatHeaderCellDef}],
})
export class MatHeaderCellDef extends CdkHeaderCellDef {}

/**
 * Footer cell definition for the mat-table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[matFooterCellDef]',
  providers: [{provide: CdkFooterCellDef, useExisting: MatFooterCellDef}],
})
export class MatFooterCellDef extends CdkFooterCellDef {}

/**
 * Column definition for the mat-table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[matColumnDef]',
  inputs: ['sticky'],
  providers: [
    {provide: CdkColumnDef, useExisting: MatColumnDef},
    {provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MatColumnDef},
  ],
})
export class MatColumnDef extends CdkColumnDef {
  /** Unique name for this column. */
  @Input('matColumnDef')
  override get name(): string {
    return this._name;
  }
  override set name(name: string) {
    this._setNameInput(name);
  }

  /**
   * Add "mat-column-" prefix in addition to "cdk-column-" prefix.
   * In the future, this will only add "mat-column-" and columnCssClassName
   * will change from type string[] to string.
   * @docs-private
   */
  protected override _updateColumnCssClassName() {
    super._updateColumnCssClassName();
    this._columnCssClassName!.push(`mat-column-${this.cssClassFriendlyName}`);
  }
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-header-cell, th[mat-header-cell]',
  host: {
    'class': 'mat-mdc-header-cell mdc-data-table__header-cell',
    'role': 'columnheader',
  },
})
export class MatHeaderCell extends CdkHeaderCell {}

/** Footer cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-footer-cell, td[mat-footer-cell]',
  host: {
    'class': 'mat-mdc-footer-cell mdc-data-table__cell',
  },
})
export class MatFooterCell extends CdkFooterCell {}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-cell, td[mat-cell]',
  host: {
    'class': 'mat-mdc-cell mdc-data-table__cell',
  },
})
export class MatCell extends CdkCell {}
