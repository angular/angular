/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatLegacyTabsModule} from '@angular/material/legacy-tabs';
import {CommonModule} from '@angular/common';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'legacy-tabs-demo',
  templateUrl: 'legacy-tabs-demo.html',
  styleUrls: ['legacy-tabs-demo.css'],
  standalone: true,
  imports: [MatLegacyTabsModule, CommonModule, MatButtonToggleModule],
})
export class LegacyTabsDemo {
  fitInkBarToContent = true;
  links = ['First', 'Second', 'Third'];
  lotsOfTabs = new Array(30).fill(0).map((_, index) => `Tab ${index}`);
  activeLink = this.links[0];
}
