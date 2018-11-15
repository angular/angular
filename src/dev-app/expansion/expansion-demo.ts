/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'expansion-demo',
  styleUrls: ['expansion-demo.css'],
  templateUrl: 'expansion-demo.html',
})
export class ExpansionDemo {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayMode = 'default';
  multi = false;
  hideToggle = false;
  disabled = false;
  showPanel3 = true;
  expandedHeight: string;
  collapsedHeight: string;
  events: string[] = [];

  addEvent(eventName: string) {
    this.events.push(`${eventName} - ${new Date().toISOString()}`);
  }
}
