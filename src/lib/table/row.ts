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
export const _MatHeaderRowDef = CdkHeaderRowDef;
export const _MatCdkRowDef = CdkRowDef;
export const _MatHeaderRow = CdkHeaderRow;
export const _MatRow = CdkRow;

/**
 * Header row definition for the mat-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[matHeaderRowDef]',
  providers: [{provide: CdkHeaderRowDef, useExisting: MatHeaderRowDef}],
  inputs: ['columns: matHeaderRowDef'],
})
export class MatHeaderRowDef extends _MatHeaderRowDef { }

/**
 * Data row definition for the mat-table.
 * Captures the header row's template and other row properties such as the columns to display.
 */
@Directive({
  selector: '[matRowDef]',
  providers: [{provide: CdkRowDef, useExisting: MatRowDef}],
  inputs: ['columns: matRowDefColumns'],
})
export class MatRowDef extends _MatCdkRowDef { }

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'mat-header-row',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-header-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatHeaderRow extends _MatHeaderRow { }

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  moduleId: module.id,
  selector: 'mat-row',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'mat-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatRow extends _MatRow { }
