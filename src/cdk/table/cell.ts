/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentChild, Directive, ElementRef, Input, TemplateRef} from '@angular/core';

/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({selector: '[cdkCellDef]'})
export class CdkCellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) { }
}

/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({selector: '[cdkHeaderCellDef]'})
export class CdkHeaderCellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) { }
}

/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
@Directive({selector: '[cdkColumnDef]'})
export class CdkColumnDef {
  /** Unique name for this column. */
  @Input('cdkColumnDef')
  get name(): string { return this._name; }
  set name(name: string) {
    // If the directive is set without a name (updated programatically), then this setter will
    // trigger with an empty string and should not overwrite the programatically set value.
    if (!name) { return; }

    this._name = name;
    this.cssClassFriendlyName = name.replace(/[^a-z0-9_-]/ig, '-');
  }
  _name: string;

  /** @docs-private */
  @ContentChild(CdkCellDef) cell: CdkCellDef;

  /** @docs-private */
  @ContentChild(CdkHeaderCellDef) headerCell: CdkHeaderCellDef;

  /**
   * Transformed version of the column name that can be used as part of a CSS classname. Excludes
   * all non-alphanumeric characters and the special characters '-' and '_'. Any characters that
   * do not match are replaced by the '-' character.
   */
  cssClassFriendlyName: string;
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
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    elementRef.nativeElement.classList.add(`cdk-column-${columnDef.cssClassFriendlyName}`);
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
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    elementRef.nativeElement.classList.add(`cdk-column-${columnDef.cssClassFriendlyName}`);
  }
}
