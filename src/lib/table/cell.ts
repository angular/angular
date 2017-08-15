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
export const _MdCellDef = CdkCellDef;
export const _MdHeaderCellDef = CdkHeaderCellDef;
export const _MdColumnDef = CdkColumnDef;
export const _MdHeaderCell = CdkHeaderCell;
export const _MdCell = CdkCell;

/**
 * Cell definition for the md-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
  selector: '[mdCellDef], [matCellDef]',
  providers: [{provide: CdkCellDef, useExisting: MdCellDef}]
})
export class MdCellDef extends _MdCellDef { }

/**
 * Header cell definition for the md-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[mdHeaderCellDef], [matHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: MdHeaderCellDef}]
})
export class MdHeaderCellDef extends _MdHeaderCellDef { }

/**
 * Column definition for the md-table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[mdColumnDef], [matColumnDef]',
  providers: [{provide: CdkColumnDef, useExisting: MdColumnDef}],
})
export class MdColumnDef extends _MdColumnDef {
  /** Unique name for this column. */
  @Input('mdColumnDef') name: string;

  // Properties with `mat-` prefix for noconflict mode.
  @Input('matColumnDef')
  get _matColumnDefName() { return this.name; }
  set _matColumnDefName(name) { this.name = name; }
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'md-header-cell, mat-header-cell',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class MdHeaderCell extends _MdHeaderCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(columnDef, elementRef, renderer);
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.cssClassFriendlyName}`);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'md-cell, mat-cell',
  host: {
    'class': 'mat-cell',
    'role': 'gridcell',
  },
})
export class MdCell extends _MdCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(columnDef, elementRef, renderer);
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.cssClassFriendlyName}`);
  }
}
