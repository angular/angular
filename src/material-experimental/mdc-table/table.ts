/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CDK_TABLE_TEMPLATE, CdkTable, _CoalescedStyleScheduler} from '@angular/cdk/table';

@Component({
  selector: 'table[mat-table]',
  exportAs: 'matTable',
  template: CDK_TABLE_TEMPLATE,
  styleUrls: ['table.css'],
  host: {
    'class': 'mat-mdc-table mdc-data-table__table',
  },
  providers: [
    {provide: CdkTable, useExisting: MatTable},
    _CoalescedStyleScheduler,
  ],
  encapsulation: ViewEncapsulation.None,
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MatTable<T> extends CdkTable<T> implements OnInit {
  /** Overrides the sticky CSS class set by the `CdkTable`. */
  protected stickyCssClass = 'mat-mdc-table-sticky';

  // After ngOnInit, the `CdkTable` has created and inserted the table sections (thead, tbody,
  // tfoot). MDC requires the `mdc-data-table__content` class to be added to the body.
  ngOnInit() {
    super.ngOnInit();
    this._elementRef.nativeElement.querySelector('tbody').classList.add('mdc-data-table__content');
  }
}
