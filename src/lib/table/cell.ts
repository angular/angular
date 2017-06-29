/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Renderer2} from '@angular/core';
import {CdkCell, CdkColumnDef, CdkHeaderCell} from '@angular/cdk';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MdHeaderCellBase = CdkHeaderCell;
export const _MdCell = CdkCell;

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'md-header-cell, mat-header-cell',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class MdHeaderCell extends _MdHeaderCellBase {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(columnDef, elementRef, renderer);
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.name}`);
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
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.name}`);
  }
}
