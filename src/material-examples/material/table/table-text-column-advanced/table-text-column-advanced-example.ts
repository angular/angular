import {Component} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatTableDataSource} from '@angular/material/table';

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
 * @title Use of 'mat-text-column' with various configurations of the interface.
 */
@Component({
  selector: 'table-text-column-advanced-example',
  styleUrls: ['table-text-column-advanced-example.css'],
  templateUrl: 'table-text-column-advanced-example.html',
})
export class TableTextColumnAdvancedExample {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  headerText: string;

  decimalPipe = new DecimalPipe('en-US');

  /** Data accessor function that transforms the weight value to have at most 2 decimal digits. */
  getWeight = (data: PeriodicElement): string => {
    const result = this.decimalPipe.transform(data.weight, '1.0-2');
    return result === null ? '' : result;
  }
}
