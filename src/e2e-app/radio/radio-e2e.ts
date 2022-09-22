/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'radio-e2e',
  templateUrl: 'radio-e2e.html',
})
export class RadioE2e {
  isGroupDisabled: boolean = false;
  groupValue: string;
}
