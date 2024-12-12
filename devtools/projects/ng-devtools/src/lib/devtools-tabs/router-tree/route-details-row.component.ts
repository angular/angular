/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, output} from '@angular/core';
import {MatChip} from '@angular/material/chips';

export type RowType = 'text' | 'chip' | 'flag' | 'list';

@Component({
  selector: '[ng-route-details-row]',
  template: `
    <th>{{title()}} :</th>
    <td>
      @if (rowType() === 'chip') {
        <mat-chip (click)="chipClick.emit()">
            {{ data() }}
          </mat-chip>
      } @else if (rowType() === 'flag') {
        <span  class="{{ data() ? 'tag-active' : 'tag-incactive' }}">
          {{ data()  ? 'Active' : 'Inactive' }}
        </span>
      } @else if (rowType() === 'list') {
        <div style="display: flex; gap: 5px">
          @for (p of data(); track $index) {
            <mat-chip (click)="chipClick.emit(p)">
              {{ p }}
            </mat-chip>
          }
        </div>
      } @else {
        {{ data() }}
      }
    </td>
  `,
  imports: [MatChip],
  styles: [
    `
      td, th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      .tag-active {
        display: inline-block;
        border-radius: 5px;
        padding: 2px 8px;
        background: #09c372;
        color: #fff;
      }

      .tag-incactive {
        display: inline-block;
        border-radius: 5px;
        padding: 2px 8px;
        background: #dc0530;
        color: #fff;
      }
    `,
  ],
})
export class RouteDetailsRowComponent {
  readonly title = input<string>();
  readonly data = input<string | string[]>();
  readonly rowType = input<RowType>('text');

  readonly chipClick = output<void | string>();
}
