/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ContentChild, Directive, ElementRef, Input, TemplateRef} from '@angular/core';
import {CanStick, CanStickCtor, mixinHasStickyInput} from './can-stick';


/** Base interface for a cell definition. Captures a column's cell template definition. */
export interface CellDef {
  template: TemplateRef<any>;
}

/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({selector: '[cdkCellDef]'})
export class CdkCellDef implements CellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) { }
}

/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({selector: '[cdkHeaderCellDef]'})
export class CdkHeaderCellDef implements CellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) { }
}

/**
 * Footer cell definition for a CDK table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
@Directive({selector: '[cdkFooterCellDef]'})
export class CdkFooterCellDef implements CellDef {
  constructor(/** @docs-private */ public template: TemplateRef<any>) { }
}

// Boilerplate for applying mixins to CdkColumnDef.
/** @docs-private */
export class CdkColumnDefBase {}
export const _CdkColumnDefBase: CanStickCtor & typeof CdkColumnDefBase =
    mixinHasStickyInput(CdkColumnDefBase);

/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[cdkColumnDef]',
  inputs: ['sticky'],
  providers: [{
    provide: 'MAT_SORT_HEADER_COLUMN_DEF',
    useExisting: CdkColumnDef
  }],
})
export class CdkColumnDef extends _CdkColumnDefBase implements CanStick {
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

  /**
   * Whether this column should be sticky positioned on the end of the row. Should make sure
   * that it mimics the `CanStick` mixin such that `_hasStickyChanged` is set to true if the value
   * has been changed.
   */
  @Input('stickyEnd')
  get stickyEnd(): boolean { return this._stickyEnd; }
  set stickyEnd(v: boolean) {
    const prevValue = this._stickyEnd;
    this._stickyEnd = coerceBooleanProperty(v);
    this._hasStickyChanged = prevValue !== this._stickyEnd;
  }
  _stickyEnd: boolean = false;

  /** @docs-private */
  @ContentChild(CdkCellDef) cell: CdkCellDef;

  /** @docs-private */
  @ContentChild(CdkHeaderCellDef) headerCell: CdkHeaderCellDef;

  /** @docs-private */
  @ContentChild(CdkFooterCellDef) footerCell: CdkFooterCellDef;

  /**
   * Transformed version of the column name that can be used as part of a CSS classname. Excludes
   * all non-alphanumeric characters and the special characters '-' and '_'. Any characters that
   * do not match are replaced by the '-' character.
   */
  cssClassFriendlyName: string;
}

/** Base class for the cells. Adds a CSS classname that identifies the column it renders in. */
export class BaseCdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    const columnClassName = `cdk-column-${columnDef.cssClassFriendlyName}`;
    elementRef.nativeElement.classList.add(columnClassName);
  }
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-header-cell, th[cdk-header-cell]',
  host: {
    'class': 'cdk-header-cell',
    'role': 'columnheader',
  },
})
export class CdkHeaderCell extends BaseCdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
  }
}

/** Footer cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-footer-cell, td[cdk-footer-cell]',
  host: {
    'class': 'cdk-footer-cell',
    'role': 'gridcell',
  },
})
export class CdkFooterCell extends BaseCdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-cell, td[cdk-cell]',
  host: {
    'class': 'cdk-cell',
    'role': 'gridcell',
  },
})
export class CdkCell extends BaseCdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    super(columnDef, elementRef);
  }
}
