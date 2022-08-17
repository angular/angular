/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MdcTableExamplesModule} from '@angular/components-examples/material-experimental/mdc-table';

@Component({
  templateUrl: 'mdc-table-demo.html',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MdcTableExamplesModule],
})
export class MdcTableDemo {}
