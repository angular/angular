/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, Provider} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {CdkTable, _CoalescedStyleScheduler, _COALESCED_STYLE_SCHEDULER} from '@angular/cdk/table';

import {
  ColumnResize,
  ResizeStrategy,
  CdkFlexTableResizeStrategy,
  TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
} from '@angular/cdk-experimental/column-resize';

export {TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER};

/**
 * Overrides CdkFlexTableResizeStrategy to match mat-column elements.
 */
@Injectable()
export class MatFlexTableResizeStrategy extends CdkFlexTableResizeStrategy {
  constructor(
    columnResize: ColumnResize,
    @Inject(_COALESCED_STYLE_SCHEDULER) styleScheduler: _CoalescedStyleScheduler,
    table: CdkTable<unknown>,
    @Inject(DOCUMENT) document: any,
  ) {
    super(columnResize, styleScheduler, table, document);
  }

  protected override getColumnCssClass(cssFriendlyColumnName: string): string {
    return `mat-column-${cssFriendlyColumnName}`;
  }
}

export const FLEX_RESIZE_STRATEGY_PROVIDER: Provider = {
  provide: ResizeStrategy,
  useClass: MatFlexTableResizeStrategy,
};
