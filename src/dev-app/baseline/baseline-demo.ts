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
  selector: 'baseline-demo',
  templateUrl: 'baseline-demo.html',
  styleUrls: ['baseline-demo.css'],
})
export class BaselineDemo {
  name: string;
}
