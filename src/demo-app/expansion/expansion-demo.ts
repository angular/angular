/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatAccordion} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'expansion-demo',
  styleUrls: ['expansion-demo.css'],
  templateUrl: 'expansion-demo.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class ExpansionDemo {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayMode: string = 'default';
  multi = false;
  hideToggle = false;
  disabled = false;
  showPanel3 = true;
  expandedHeight: string;
  collapsedHeight: string;
}
