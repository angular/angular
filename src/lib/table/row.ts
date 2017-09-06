/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Directive, ViewEncapsulation} from '@angular/core';
import {
  CdkHeaderRow,
  CdkRow,
  CDK_ROW_TEMPLATE,
  CdkRowDef,
  CdkHeaderRowDef,
} from '@angular/cdk/table';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MdHeaderRowDef = CdkHeaderRowDef;
export const _MdCdkRowDef = CdkRowDef;
export const _MdHeaderRow = CdkHeaderRow;
export const _MdRow = CdkRow;

/**
 * Header row definition for the md-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[mdHeaderRowDef]',
  providers: [{provide: CdkHeaderRowDef, useExisting: MdHeaderRowDef}],
  inputs: ['columns: mdHeaderRowDef'],
})
export class MdHeaderRowDef extends _MdHeaderRowDef { }

/** Mat-compatible version of MdHeaderRowDef */
@Directive({
  selector: '[matHeaderRowDef]',
  providers: [{provide: CdkHeaderRowDef, useExisting: MatHeaderRowDef}],
  inputs: ['columns: matHeaderRowDef'],
})
export class MatHeaderRowDef extends _MdHeaderRowDef { }

/**
 * Data row definition for the md-table.
 * Captures the header row's template and other row properties such as the columns to display.
 */
@Directive({
  selector: '[mdRowDef]',
  providers: [{provide: CdkRowDef, useExisting: MdRowDef}],
  inputs: ['columns: mdRowDefColumns'],
})
export class MdRowDef extends _MdCdkRowDef { }

/** Mat-compatible version of MdRowDef */
@Directive({
  selector: '[matRowDef]',
  providers: [{provide: CdkRowDef, useExisting: MatRowDef}],
  inputs: ['columns: matRowDefColumns'],
})
export class MatRowDef extends _MdCdkRowDef { }

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'md-header-row, mat-header-row',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-header-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdHeaderRow extends _MdHeaderRow { }

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'md-row, mat-row',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdRow extends _MdRow { }
