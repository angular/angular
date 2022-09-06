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
 * @deprecated Use `MatCellDef` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: '[matCellDef]',
  providers: [{provide: CdkCellDef, useExisting: MatLegacyCellDef}],
})
export class MatLegacyCellDef extends CdkCellDef {}

/**
 * Header cell definition for the mat-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 * @deprecated Use `MatHeaderCellDef` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: '[matHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: MatLegacyHeaderCellDef}],
})
export class MatLegacyHeaderCellDef extends CdkHeaderCellDef {}

/**
 * Footer cell definition for the mat-table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 * @deprecated Use `MatFooterCellDef` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: '[matFooterCellDef]',
  providers: [{provide: CdkFooterCellDef, useExisting: MatLegacyFooterCellDef}],
})
export class MatLegacyFooterCellDef extends CdkFooterCellDef {}

/**
 * Column definition for the mat-table.
 * Defines a set of cells available for a table column.
 * @deprecated Use `MatColumnDef` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: '[matColumnDef]',
  inputs: ['sticky'],
  providers: [
    {provide: CdkColumnDef, useExisting: MatLegacyColumnDef},
    {provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MatLegacyColumnDef},
  ],
})
export class MatLegacyColumnDef extends CdkColumnDef {
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

/**
 * Header cell template container that adds the right classes and role.
 * @deprecated Use `MatHeaderCell` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: 'mat-header-cell, th[mat-header-cell]',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class MatLegacyHeaderCell extends CdkHeaderCell {}

/**
 * Footer cell template container that adds the right classes and role.
 * @deprecated Use `MatFooterCell` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: 'mat-footer-cell, td[mat-footer-cell]',
  host: {
    'class': 'mat-footer-cell',
    'role': 'gridcell',
  },
})
export class MatLegacyFooterCell extends CdkFooterCell {}

/**
 * Cell template container that adds the right classes and role.
 * @deprecated Use `MatCell` from `@angular/material/table` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: 'mat-cell, td[mat-cell]',
  host: {
    'class': 'mat-cell',
    'role': 'gridcell',
  },
})
export class MatLegacyCell extends CdkCell {}
