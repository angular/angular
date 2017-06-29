/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Renderer2} from '@angular/core';
import {CdkCell, CdkColumnDef, CdkHeaderCell} from '../core/data-table/cell';

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'md-header-cell, mat-header-cell',
  host: {
    'class': 'mat-header-cell',
    'role': 'columnheader',
  },
})
export class MdHeaderCell extends CdkHeaderCell {
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
export class MdCell extends CdkCell {
  constructor(columnDef: CdkColumnDef,
              elementRef: ElementRef,
              renderer: Renderer2) {
    super(columnDef, elementRef, renderer);
    renderer.addClass(elementRef.nativeElement, `mat-column-${columnDef.name}`);
  }
}
