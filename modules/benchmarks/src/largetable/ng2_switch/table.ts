import {Component, Input, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TableCell, emptyTable} from '../util';

@Component({
  selector: 'largetable',
  template: `<table><tbody>
    <tr *ngFor="let row of data">
    <template ngFor [ngForOf]="row" let-cell>
      <ng-container [ngSwitch]="cell.row % 2">
        <td *ngSwitchCase="0" style="background-color: grey">{{cell.value}}</td>
        <td *ngSwitchDefault>{{cell.value}}</td>
      </ng-container>
    </template>
    </tr></tbody></table>`
})
export class TableComponent {
  @Input()
  data: TableCell[][] = emptyTable;
}

@NgModule({imports: [BrowserModule], bootstrap: [TableComponent], declarations: [TableComponent]})
export class AppModule {
}
