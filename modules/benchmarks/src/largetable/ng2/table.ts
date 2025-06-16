/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, Input} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {emptyTable, TableCell} from '../util';

let trustedEmptyColor: SafeStyle | null = null;
let trustedGreyColor: SafeStyle | null = null;

@Component({
  selector: 'largetable',
  template: `<table>
    <tbody>
      @for (row of data; track $index) {
        <tr>
          @for (cell of row; track $index) {
            <td [style.backgroundColor]="getColor(cell.row)">{{ cell.value }}</td>
          }
        </tr>
      }
    </tbody>
  </table>`,
})
export class TableComponent {
  @Input() data: TableCell[][] = emptyTable;

  constructor() {
    if (trustedEmptyColor === null) {
      const sanitizer = inject(DomSanitizer);
      trustedEmptyColor = sanitizer.bypassSecurityTrustStyle('white');
      trustedGreyColor = sanitizer.bypassSecurityTrustStyle('grey');
    }
  }

  getColor(row: number) {
    return row % 2 ? trustedEmptyColor : trustedGreyColor;
  }
}
