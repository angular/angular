/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {TableCell} from '../util';

let trustedEmptyColor: SafeStyle;
let trustedGreyColor: SafeStyle;

@Component({
  standalone: true,
  selector: 'app',
  template: `
    <table>
      <tbody>
        @for (row of data; track $index) {
        <tr>
          @for (cell of row; track $index) {
          <td [style.backgroundColor]="getColor(cell.row)">
            @if (condition) {
            <!--
                    Use static text in cells to avoid the need
                    to run a new change detection cycle.
                  -->
            Cell }
          </td>
          }
        </tr>
        }
      </tbody>
    </table>
  `,
})
export class AppComponent {
  @Input() data: TableCell[][] = [];

  condition = true;

  constructor(sanitizer: DomSanitizer) {
    trustedEmptyColor = sanitizer.bypassSecurityTrustStyle('white');
    trustedGreyColor = sanitizer.bypassSecurityTrustStyle('grey');
  }

  getColor(row: number) {
    return row % 2 ? trustedEmptyColor : trustedGreyColor;
  }
}
