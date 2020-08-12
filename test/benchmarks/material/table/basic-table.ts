/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';

@Component({
  selector: 'basic-table',
  templateUrl: './basic-table.html',
  styles: ['table { width: 100% }', 'th.mat-header-cell, td.mat-cell { padding: 0px 20px }'],
})
export class BasicTable {
  @Input() cols: string[];
  @Input() rows: Record<string, string>[];
}
