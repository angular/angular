import {Component, Input, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TableCell, emptyTable} from '../util';

@Component({
  selector: 'largetable',
  template:
      `<table><tbody><tr *ngFor="let row of data; trackBy: trackByIndex"><td *ngFor="let cell of row; trackBy: trackByIndex" [style.backgroundColor]="cell.row % 2 ? '' : 'grey'">{{cell.value}}</td></tr></tbody></table>`
})
export class TableComponent {
  @Input()
  data: TableCell[][] = emptyTable;

  trackByIndex(index: number, item: any) { return index; }
}

@NgModule({imports: [BrowserModule], bootstrap: [TableComponent], declarations: [TableComponent]})
export class AppModule {
}
