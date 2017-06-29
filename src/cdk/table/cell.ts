/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentChild, Directive, ElementRef, Input, Renderer2, TemplateRef} from '@angular/core';

/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({selector: '[cdkCellDef]'})
export class CdkCellDef {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({selector: '[cdkHeaderCellDef]'})
export class CdkHeaderCellDef {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
@Directive({selector: '[cdkColumnDef]'})
export class CdkColumnDef {
  @Input('cdkColumnDef') name: string;

  @ContentChild(CdkCellDef) cell: CdkCellDef;
  @ContentChild(CdkHeaderCellDef) headerCell: CdkHeaderCellDef;
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-header-cell',
  host: {
    'class': 'cdk-header-cell',
    'role': 'columnheader',
  },
})
export class CdkHeaderCell {
  constructor(private columnDef: CdkColumnDef,
              private elementRef: ElementRef,
              private renderer: Renderer2) {
    this.renderer.addClass(elementRef.nativeElement, `cdk-column-${columnDef.name}`);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-cell',
  host: {
    'class': 'cdk-cell',
    'role': 'gridcell',
  },
})
export class CdkCell {
  constructor(private columnDef: CdkColumnDef,
              private elementRef: ElementRef,
              private renderer: Renderer2) {
    this.renderer.addClass(elementRef.nativeElement, `cdk-column-${columnDef.name}`);
  }
}
