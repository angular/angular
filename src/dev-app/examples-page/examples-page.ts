/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '@angular/material-examples';

/** Renders all material examples listed in the generated EXAMPLE_COMPONENTS. */
@Component({
  template: `<material-example-list [ids]="examples"></material-example-list>`
})
export class ExamplesPage {
  examples = Object.keys(EXAMPLE_COMPONENTS);
}
