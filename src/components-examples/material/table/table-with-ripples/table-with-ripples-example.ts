import {Component} from '@angular/core';

const ELEMENT_DATA = [
  {name: 'Hydrogen'},
  {name: 'Helium'},
  {name: 'Lithium'},
  {name: 'Beryllium'},
  {name: 'Boron'},
  {name: 'Carbon'},
  {name: 'Nitrogen'},
  {name: 'Oxygen'},
  {name: 'Fluorine'},
  {name: 'Neon'},
];

/**
 * @title Tables with Material Design ripples.
 */
@Component({
  selector: 'table-with-ripples-example',
  templateUrl: 'table-with-ripples-example.html',
})
export class TableWithRipplesExample {
  displayedColumns: string[] = ['name'];
  dataSource = ELEMENT_DATA;
}
