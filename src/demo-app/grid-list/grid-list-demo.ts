import {Component} from '@angular/core';
import {MD_GRID_LIST_DIRECTIVES} from '@angular2-material/grid-list/grid-list';
import {MdButton} from '@angular2-material/button/button';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card/card';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon/icon';

@Component({
  moduleId: module.id,
  selector: 'grid-list-demo',
  templateUrl: 'grid-list-demo.html',
  styleUrls: ['grid-list-demo.css'],
  directives: [MD_GRID_LIST_DIRECTIVES, MdButton, MD_CARD_DIRECTIVES, MdIcon],
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

  fixedCols: number = 4;
  fixedRowHeight: number = 100;
  ratioGutter: number = 1;
  fitListHeight: string = '400px';
  ratio: string = '4:1';

  addTileCols() { this.tiles[2].cols++; }
}
