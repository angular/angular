/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, Input, NgModule, ɵdetectChanges} from '@angular/core';

import {buildTable, emptyTable, TableCell} from '../util';

@Component({
  selector: 'largetable',
  template: `
    <table>
      <tbody>
        <tr *ngFor="let row of data; trackBy: trackByIndex">
          <td *ngFor="let cell of row; trackBy: trackByIndex" [style.background-color]="getColor(cell.row)">
            {{cell.value}}
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class LargeTableComponent {
  @Input() data: TableCell[][] = emptyTable;

  trackByIndex(index: number, item: any) {
    return index;
  }

  getColor(row: number) {
    return row % 2 ? '' : 'grey';
  }
}

@NgModule({declarations: [LargeTableComponent], imports: [CommonModule]})
export class TableModule {
}


export function destroyDom(component: LargeTableComponent) {
  component.data = emptyTable;
  ɵdetectChanges(component);
}

export function createDom(component: LargeTableComponent) {
  component.data = buildTable();
  ɵdetectChanges(component);
}
