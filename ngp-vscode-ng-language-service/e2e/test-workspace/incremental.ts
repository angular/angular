/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'app-isolated-inc',
  template: '<div>Hello {{ name }}</div>',
  standalone: true,
})
export class IsolatedIncComponent {
  name = 'Angular LS Test';
}
