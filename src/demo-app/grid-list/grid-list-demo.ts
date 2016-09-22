import {Component} from '@angular/core';
import {MdIconRegistry} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'grid-list-demo',
  templateUrl: 'grid-list-demo.html',
  styleUrls: ['grid-list-demo.css'],
  providers: [MdIconRegistry]
})
export class GridListDemo {
  tiles: any[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  dogs: Object[] = [
    { name: 'Porter', human: 'Kara' },
    { name: 'Mal', human: 'Jeremy' },
    { name: 'Koby', human: 'Igor' },
    { name: 'Razzle', human: 'Ward' },
    { name: 'Molly', human: 'Rob' },
    { name: 'Husi', human: 'Matias' },
  ];

  basicRowHeight = 80;
  fixedCols = 4;
  fixedRowHeight = 100;
  ratioGutter = 1;
  fitListHeight = '400px';
  ratio = '4:1';

  addTileCols() { this.tiles[2].cols++; }
}
