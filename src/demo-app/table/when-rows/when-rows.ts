/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {Element, ELEMENT_DATA} from '../element-data';

@Component({
  moduleId: module.id,
  templateUrl: 'when-rows.html',
})
export class WhenRowsDemo {
  columns = ['name', 'weight', 'symbol', 'position'];
  dataSource: Element[] = ELEMENT_DATA.slice();

  isOdd = (i: number, _d: Element) => i % 2 !== 0;
}
