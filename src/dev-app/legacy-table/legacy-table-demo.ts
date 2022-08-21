/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkTableExamplesModule} from '@angular/components-examples/cdk/table';
import {LegacyTableExamplesModule} from './examples/index';

@Component({
  templateUrl: './legacy-table-demo.html',
  standalone: true,
  imports: [CdkTableExamplesModule, LegacyTableExamplesModule],
})
export class LegacyTableDemo {}
