/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component} from '@angular/core';

export interface RowData {
  id: number;
  label: string;
}

@Component({
  selector: 'js-web-frameworks',
  template: `
    <table class="table table-hover table-striped test-data">
      <tbody>
        @for(item of data; track item.id) {
          <tr [class.danger]="item.id === selected">
            <td class="col-md-1">{{ item.id }}</td>
            <td class="col-md-4">
              <a href="#" (click)="select(item.id); $event.preventDefault()">{{ item.label }}</a>
            </td>
            <td class="col-md-1">
              <a href="#" (click)="delete(item.id); $event.preventDefault()">
                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
              </a>
            </td>
            <td class="col-md-6"></td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class JsWebFrameworksComponent {
  data: Array<RowData> = [];
  selected: number | null = null;

  constructor(private _appRef: ApplicationRef) {}

  select(itemId: number) {
    this.selected = itemId;
    this._appRef.tick();
  }

  delete(itemId: number) {
    const data = this.data;
    for (let i = 0, l = data.length; i < l; i++) {
      if (data[i].id === itemId) {
        data.splice(i, 1);
        break;
      }
    }
    this._appRef.tick();
  }
}
