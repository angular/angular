/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkCellDef, CdkColumnDef, CdkHeaderCellDef, CdkTable} from '@angular/cdk/table';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Inject,
} from '@angular/core';

import {CdkSelection} from './selection';

/**
 * Column that adds row selecting checkboxes and a select-all checkbox if `cdkSelectionMultiple` is
 * `true`.
 *
 * Must be used within a parent `CdkSelection` directive.
 */
@Component({
  selector: 'cdk-selection-column',
  template: `
    <ng-container cdkColumnDef>
      <th cdkHeaderCell *cdkHeaderCellDef>
        <input type="checkbox" *ngIf="selection.multiple"
            cdkSelectAll
            #allToggler="cdkSelectAll"
            [checked]="allToggler.checked | async"
            [indeterminate]="allToggler.indeterminate | async"
            (click)="allToggler.toggle($event)">
      </th>
      <td cdkCell *cdkCellDef="let row; let i = $index">
        <input type="checkbox"
            #toggler="cdkSelectionToggle"
            cdkSelectionToggle
            [cdkSelectionToggleValue]="row"
            [cdkSelectionToggleIndex]="i"
            (click)="toggler.toggle()"
            [checked]="toggler.checked | async">
      </td>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkSelectionColumn<T> implements OnInit, OnDestroy {
  /** Column name that should be used to reference this column. */
  @Input('cdkSelectionColumnName')
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    this._name = name;

    this._syncColumnDefName();
  }
  private _name: string;

  @ViewChild(CdkColumnDef, {static: true}) private readonly _columnDef: CdkColumnDef;
  @ViewChild(CdkCellDef, {static: true}) private readonly _cell: CdkCellDef;
  @ViewChild(CdkHeaderCellDef, {static: true}) private readonly _headerCell: CdkHeaderCellDef;

  constructor(
    @Optional() @Inject(CdkTable) private _table: CdkTable<T>,
    @Optional() @Inject(CdkSelection) readonly selection: CdkSelection<T>,
  ) {}

  ngOnInit() {
    if (!this.selection && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('CdkSelectionColumn: missing CdkSelection in the parent');
    }

    this._syncColumnDefName();

    if (this._table) {
      this._columnDef.cell = this._cell;
      this._columnDef.headerCell = this._headerCell;
      this._table.addColumnDef(this._columnDef);
    } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw Error('CdkSelectionColumn: missing parent table');
    }
  }

  ngOnDestroy() {
    if (this._table) {
      this._table.removeColumnDef(this._columnDef);
    }
  }

  private _syncColumnDefName() {
    if (this._columnDef) {
      this._columnDef.name = this._name;
    }
  }
}
