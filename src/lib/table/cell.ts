/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input, Renderer2} from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
} from '@angular/cdk/table';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MatCellDef = CdkCellDef;
export const _MatHeaderCellDef = CdkHeaderCellDef;
export const _MatColumnDef = CdkColumnDef;
export const _MatHeaderCell = CdkHeaderCell;
export const _MatCell = CdkCell;

/**
 * Cell definition for the mat-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
  selector: '[matCellDef]',
  providers: [{provide: CdkCellDef, useExisting: MatCellDef}]
})
export class MatCellDef extends _MatCellDef { }

/**
 * Header cell definition for the mat-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[matHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: MatHeaderCellDef}]
})
export class MatHeaderCellDef extends _MatHeaderCellDef { }

/**
 * Column definition for the mat-table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[matColumnDef]',
  providers: [{provide: CdkColumnDef, useExisting: MatColumnDef}],
})
export class MatColumnDef extends _MatColumnDef {
  /** Unique name for this column. */
  @Input('matColumnDef') name: string;
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-header-cell',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class MatHeaderCell extends _MatHeaderCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(columnDef, elementRef, renderer);
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.cssClassFriendlyName}`);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'mat-cell',
  host: {
    'class': 'mat-cell',
    'role': 'gridcell',
  },
})
export class MatCell extends _MatCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(columnDef, elementRef, renderer);
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.cssClassFriendlyName}`);
  }
}
