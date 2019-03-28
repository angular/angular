/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'expansion-demo',
  template: `<example-list-viewer [ids]="examples"></example-list-viewer>`,
})
export class ExpansionE2e {
  examples = ['expansion-overview'];
}
