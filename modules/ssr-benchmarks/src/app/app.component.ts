/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {testData} from '../../test-data';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <table>
      <tbody>
        @for(entry of data; track $index) {
        <tr (click)="onClick()">
          <td>{{ entry.id }}</td>
          <td>{{ entry.name }}</td>
        </tr>
        }
      </tbody>
    </table>
  `,
})
export class AppComponent {
  data = testData();
  onClick() {}
}
