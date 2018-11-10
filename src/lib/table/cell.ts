/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input} from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef, CdkFooterCell, CdkFooterCellDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
} from '@angular/cdk/table';

/**
 * Cell definition for the mat-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
  selector: '[matCellDef]',
  providers: [{provide: CdkCellDef, useExisting: MatCellDef}]
})
export class MatCellDef extends CdkCellDef {}

/**
 * Header cell definition for the mat-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[matHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: MatHeaderCellDef}]
})
export class MatHeaderCellDef extends CdkHeaderCellDef {}

/**
 * Footer cell definition for the mat-table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[matFooterCellDef]',
  providers: [{provide: CdkFooterCellDef, useExisting: MatFooterCellDef}]
})
export class MatFooterCellDef extends CdkFooterCellDef {}

/**
 * Column definition for the mat-table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[matColumnDef]',
  providers: [
    {provide: CdkColumnDef, useExisting: MatColumnDef},
    {provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MatColumnDef}
  ],
})
export class MatColumnDef extends CdkColumnDef {
  /** Unique name for this column. */
  @Input('matColumnDef') name: string;

  /** Whether this column should be sticky positioned at the start of the row */
  @Input() sticky: boolean;

  /** Whether this column should be sticky positioned on the end of the row */
  @Input() stickyEnd: boolean;
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-header-cell, th[mat-header-cell]',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class MatHeaderCell extends CdkHeaderCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef<HTMLElement>) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`mat-column-${columnDef.cssClassFriendlyName}`);
  }
}

/** Footer cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-footer-cell, td[mat-footer-cell]',
  host: {
    'class': 'mat-footer-cell',
    'role': 'gridcell',
  },
})
export class MatFooterCell extends CdkFooterCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`mat-column-${columnDef.cssClassFriendlyName}`);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-cell, td[mat-cell]',
  host: {
    'class': 'mat-cell',
    'role': 'gridcell',
  },
})
export class MatCell extends CdkCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef<HTMLElement>) {
    super(columnDef, elementRef);
    elementRef.nativeElement.classList.add(`mat-column-${columnDef.cssClassFriendlyName}`);
  }
}
