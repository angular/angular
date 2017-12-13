/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, Optional, ViewChild} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatSortHeader} from '@angular/material/sort';
import {MatColumnDef, MatTable} from '@angular/material';

/**
 * Column that shows simply shows text content for the header and row
 * cells. By default, the name of this column will be assumed to be both the header
 * text and data property used to access the data value to show in cells. To override
 * the header text, provide a label text. To override the data cell values,
 * provide a dataAccessor function that provides the string to display for each row's cell.
 *
 * Note that this component sets itself as visually hidden since it will show up in the `mat-table`
 * DOM because it is an empty element with an ng-container (nothing rendered). It should not
 * interfere with screen readers.
 */
@Component({
  selector: 'simple-column',
  template: `
    <ng-container matColumnDef>
      <mat-header-cell *matHeaderCellDef mat-sort-header>
        {{label || name}}
      </mat-header-cell>

      <mat-cell *matCellDef="let data">
        {{getData(data)}}
      </mat-cell>
    </ng-container>
  `,
  host: {
    'class': 'simple-column cdk-visually-hidden',
    '[attr.ariaHidden]': 'true',
  }
})
export class SimpleColumn<T> {
  /** Column name that should be used to reference this column. */
  @Input()
  get name(): string { return this._name; }
  set name(name: string) {
    this._name = name;
    this.columnDef.name = name;
  }
  _name: string;

  /**
   * Text label that should be used for the column header. If this property is not
   * set, the header text will default to the column name.
   */
  @Input() label: string;

  /**
   * Accessor function to retrieve the data should be provided to the cell. If this
   * property is not set, the data cells will assume that the column name is the same
   * as the data property the cells should display.
   */
  @Input() dataAccessor: ((data: T, name: string) => string);

  /** Alignment of the cell values. */
  @Input() align: 'before' | 'after' = 'before';

  /** Whether the column is sortable */
  @Input()
  get sortable(): boolean { return this._sortable; }
  set sortable(sortable: boolean) {
    this._sortable = coerceBooleanProperty(sortable);
  }
  _sortable: boolean;

  @ViewChild(MatColumnDef) columnDef: MatColumnDef;

  @ViewChild(MatSortHeader) sortHeader: MatSortHeader;

  constructor(@Optional() public table: MatTable<any>) { }

  ngOnInit() {
    if (this.table) {
      this.table.addColumnDef(this.columnDef);
    }
  }

  ngOnDestroy() {
    if (this.table) {
      this.table.removeColumnDef(this.columnDef);
    }
  }

  getData(data: T): any {
    return this.dataAccessor ? this.dataAccessor(data, this.name) : (<any>data)[this.name];
  }
}
