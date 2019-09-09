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
  selector: 'mdc-tabs-demo',
  templateUrl: 'mdc-tabs-demo.html',
  styleUrls: ['mdc-tabs-demo.css'],
})
export class MdcTabsDemo {
  links = ['First', 'Second', 'Third'];
  lotsOfTabs = new Array(30).fill(0).map((_, index) => `Tab ${index}`);
  activeLink = this.links[0];
}
