import {Component, Input, OnDestroy, OnInit, Optional, ViewChild} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
    MatColumnDef,
    MatSort,
    MatSortHeader,
    MatTable,
    MatTableDataSource
} from '@angular/material';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

/**
 * @title Table with a custom column component for easy column definition reuse.
 */
@Component({
  selector: 'table-simple-column-example',
  styleUrls: ['table-simple-column-example.css'],
  templateUrl: 'table-simple-column-example.html',
})
export class TableSimpleColumnExample implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  getWeight = (data: PeriodicElement) => '~' + data.weight;

  @ViewChild('sort') sort: MatSort;

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }
}

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
      <th mat-header-cell *matHeaderCellDef mat-sort-header> {{label || name}} </th>
      <td mat-cell *matCellDef="let data"> {{getData(data)}}</td>
    </ng-container>
  `,
  host: {
    'class': 'simple-column cdk-visually-hidden',
    '[attr.ariaHidden]': 'true',
  }
})
export class SimpleColumn<T> implements OnDestroy, OnInit {
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
    return this.dataAccessor ? this.dataAccessor(data, this.name) : (data as any)[this.name];
  }
}
