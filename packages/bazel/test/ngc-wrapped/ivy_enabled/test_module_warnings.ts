/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

/** Test component which contains an invalid banana in box warning. Should build successfully. */
@Component({
  template: `
    <div ([foo])="bar"></div>
  `,
})
export class TestCmp {
  bar: string = 'test';
}
