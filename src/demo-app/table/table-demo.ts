/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';


@Component({
  moduleId: module.id,
  template: '<material-example-list [ids]="examples"></material-example-list>',
})
export class TableDemo {
  examples = Object.keys(EXAMPLE_COMPONENTS)
      .filter(example => example.startsWith('table-') || example.startsWith('cdk-table-'));
}
