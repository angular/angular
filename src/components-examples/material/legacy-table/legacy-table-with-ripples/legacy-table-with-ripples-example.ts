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
  selector: 'legacy-table-with-ripples-example',
  styleUrls: ['legacy-table-with-ripples-example.css'],
  templateUrl: 'legacy-table-with-ripples-example.html',
})
export class LegacyTableWithRipplesExample {
  displayedColumns: string[] = ['name'];
  dataSource = ELEMENT_DATA;
}
