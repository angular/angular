import {DataSource} from '@angular/cdk/collections';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  OnInit,
  QueryList,
  ViewChild
} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';

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
 * @title Table example that shows how to wrap a table component for definition and behavior reuse.
 */
@Component({
  selector: 'table-wrapped-example',
  styleUrls: ['table-wrapped-example.css'],
  templateUrl: 'table-wrapped-example.html',
})
export class TableWrappedExample implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild('sort', {static: true}) sort: MatSort;

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }
}

/**
 * Table component that accepts column and row definitions in its content to be registered to the
 * table.
 */
@Component({
  selector: 'wrapper-table',
  templateUrl: 'wrapper-table.html',
  styles: [`
    table {
      width: 100%;
    }
  `]
})
export class WrapperTable<T> implements AfterContentInit {
  @ContentChildren(MatHeaderRowDef) headerRowDefs: QueryList<MatHeaderRowDef>;
  @ContentChildren(MatRowDef) rowDefs: QueryList<MatRowDef<T>>;
  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;

  @ViewChild(MatTable, {static: true}) table: MatTable<T>;

  @Input() columns: string[];

  @Input() dataSource: DataSource<T>;

  ngAfterContentInit() {
    this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef));
    this.rowDefs.forEach(rowDef => this.table.addRowDef(rowDef));
    this.headerRowDefs.forEach(headerRowDef => this.table.addHeaderRowDef(headerRowDef));
  }
}
